import {
  setTimeout as delay,
} from 'node:timers/promises';

import {
  createDatabasePool,
} from '@versa/database';

import {
  PerformanceMonotonicClock,
  StructuredLogger,
  jsonConsoleSink,
} from '@versa/observability';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import {
  env,
} from './config/env.js';

import {
  processNextOutboxEvent,
} from './outbox/process-next-outbox-event.js';

let stopping = false;

function requestShutdown(
  signal: NodeJS.Signals,
): void {
  stopping = true;

  console.info(
    `[worker] Sinal ${signal} recebido`,
  );
}

async function main():
Promise<void> {
  const pool =
    createDatabasePool(
      env.database,
    );

  const idGenerator =
    new RandomUuidGenerator();

  const systemClock =
    new SystemClock();

  const monotonicClock =
    new PerformanceMonotonicClock();

  const logger =
    new StructuredLogger(
      'worker',
      systemClock,
      jsonConsoleSink,
    );

  process.once(
    'SIGINT',
    () => {
      requestShutdown(
        'SIGINT',
      );
    },
  );

  process.once(
    'SIGTERM',
    () => {
      requestShutdown(
        'SIGTERM',
      );
    },
  );

  logger.info({
    message:
      'Worker started',

    event:
      'worker.started',
  });

  try {
    while (!stopping) {
      try {
        const processed =
          await processNextOutboxEvent({
            pool,

            idGenerator,

            logger,

            monotonicClock,

            retryPolicy:
              env.retryPolicy,
          });

        if (!processed) {
          await delay(
            env.pollIntervalMs,
          );
        }
      } catch (error) {
        logger.error({
          message:
            'Worker iteration failed',

          event:
            'worker.iteration.failed',

          error,
        });

        await delay(
          env.pollIntervalMs,
        );
      }
    }
  } finally {
    await pool.end();

    logger.info({
      message:
        'Worker stopped',

      event:
        'worker.stopped',
    });
  }
}

main().catch(
  (error: unknown) => {
    console.error(
      '[worker] Falha fatal',
      error,
    );

    process.exitCode = 1;
  },
);