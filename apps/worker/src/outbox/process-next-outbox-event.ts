import {
  CATEGORY_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_NAME,
} from '@versa/event-contracts';

import {
  acknowledgeCategoryCreated,
} from './acknowledge-category-created.js';

import type {
  ExecutionContext,
  Logger,
  MonotonicClock,
} from '@versa/observability';

import type {
  IdGenerator,
} from '@versa/shared-kernel';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Pool,
  PoolClient,
} from 'pg';

import type {
  OutboxEventRow,
} from './outbox-event-row.js';

import {
  projectProductCreated,
} from './project-product-created.js';

import {
  decideOutboxRetry,
} from './retry-policy.js';

import type {
  OutboxRetryPolicy,
} from './retry-policy.js';

interface Dependencies {
  readonly pool:
    Pool;

  readonly idGenerator:
    IdGenerator;

  readonly logger:
    Logger;

  readonly monotonicClock:
    MonotonicClock;

  readonly retryPolicy:
    OutboxRetryPolicy;
}

function createWorkerContext(
  event: OutboxEventRow,
  idGenerator: IdGenerator,
): ExecutionContext {
  return {
    correlationId:
      parseUuid(
        event.correlationId,
      ),

    executionId:
      idGenerator.generate(),

    causationId:
      parseUuid(
        event.eventId,
      ),
  };
}

function normalizeErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

async function dispatchEvent(
  client: PoolClient,
  event: OutboxEventRow,
): Promise<void> {
  switch (event.eventName) {
    case PRODUCT_CREATED_EVENT_NAME:
      await projectProductCreated(
        client,
        event,
      );

      return;

    case CATEGORY_CREATED_EVENT_NAME:
      acknowledgeCategoryCreated(
        event,
      );

      return;

    default:
      throw new Error(
        `Evento não suportado: ${event.eventName}`,
      );
  }
}

export async function processNextOutboxEvent(
  dependencies: Dependencies,
): Promise<boolean> {
  const client =
    await dependencies.pool.connect();

  let transactionOpen = false;

  try {
    await client.query(
      'BEGIN',
    );

    transactionOpen = true;

    const result =
      await client.query<OutboxEventRow>(
        `
          SELECT
            event_id
              AS "eventId",

            tenant_id
              AS "tenantId",

            correlation_id
              AS "correlationId",

            causation_id
              AS "causationId",

            aggregate_type
              AS "aggregateType",

            aggregate_id
              AS "aggregateId",

            event_name
              AS "eventName",

            event_version
              AS "eventVersion",

            payload,

            occurred_at
              AS "occurredAt",

            processing_attempts
              AS "processingAttempts"

          FROM event_outbox

          WHERE
            processed_at IS NULL
            AND dead_lettered_at IS NULL
            AND next_attempt_at <= now()

          ORDER BY
            next_attempt_at,
            created_at,
            event_id

          FOR UPDATE SKIP LOCKED

          LIMIT 1
        `,
      );

    const event =
      result.rows[0];

    if (
      event === undefined
    ) {
      await client.query(
        'COMMIT',
      );

      transactionOpen = false;

      return false;
    }

    const context =
      createWorkerContext(
        event,
        dependencies.idGenerator,
      );

    const startedAt =
      dependencies
        .monotonicClock
        .nowMs();

    dependencies.logger.info({
      message:
        'Outbox event processing started',

      event:
        'outbox.processing.started',

      context,

      data: {
        eventId:
          event.eventId,

        eventName:
          event.eventName,

        aggregateId:
          event.aggregateId,

        attempt:
          event.processingAttempts +
          1,
      },
    });

    await client.query(
      'SAVEPOINT event_processing',
    );

    try {
      await dispatchEvent(
        client,
        event,
      );

      await client.query(
        `
          UPDATE event_outbox
          SET
            processed_at = now(),

            processing_attempts =
              processing_attempts + 1,

            last_error = NULL,

            next_attempt_at = NULL

          WHERE event_id = $1
        `,
        [
          event.eventId,
        ],
      );

      await client.query(
        'RELEASE SAVEPOINT event_processing',
      );

      await client.query(
        'COMMIT',
      );

      transactionOpen = false;

      const durationMs =
        dependencies
          .monotonicClock
          .nowMs() -
        startedAt;

      dependencies.logger.info({
        message:
          'Outbox event processing completed',

        event:
          'outbox.processing.completed',

        context,

        durationMs,

        data: {
          eventId:
            event.eventId,

          eventName:
            event.eventName,

          aggregateId:
            event.aggregateId,
        },
      });

      return true;
    } catch (error) {
      await client.query(
        'ROLLBACK TO SAVEPOINT event_processing',
      );

      const retryDecision =
        decideOutboxRetry(
          event.processingAttempts,
          dependencies.retryPolicy,
        );

      if (
        retryDecision.deadLetter
      ) {
        await client.query(
          `
            UPDATE event_outbox
            SET
              processing_attempts =
                processing_attempts + 1,

              last_error = $2,

              next_attempt_at = NULL,

              dead_lettered_at = now()

            WHERE event_id = $1
          `,
          [
            event.eventId,

            normalizeErrorMessage(
              error,
            ),
          ],
        );
      } else {
        await client.query(
          `
            UPDATE event_outbox
            SET
              processing_attempts =
                processing_attempts + 1,

              last_error = $2,

              next_attempt_at =
                now() +
                (
                  $3::integer *
                  interval '1 millisecond'
                )

            WHERE event_id = $1
          `,
          [
            event.eventId,

            normalizeErrorMessage(
              error,
            ),

            retryDecision.nextDelayMs,
          ],
        );
      }

      await client.query(
        'RELEASE SAVEPOINT event_processing',
      );

      await client.query(
        'COMMIT',
      );

      transactionOpen = false;

      const durationMs =
        dependencies
          .monotonicClock
          .nowMs() -
        startedAt;

      dependencies.logger.error({
        message:
          retryDecision.deadLetter
            ? 'Outbox event dead-lettered'
            : 'Outbox event retry scheduled',

        event:
          retryDecision.deadLetter
            ? 'outbox.processing.dead_lettered'
            : 'outbox.processing.retry_scheduled',

        context,

        durationMs,

        error,

        data: {
          eventId:
            event.eventId,

          eventName:
            event.eventName,

          aggregateId:
            event.aggregateId,

          attempt:
            retryDecision.attempt,

          deadLetter:
            retryDecision.deadLetter,

          nextDelayMs:
            retryDecision.nextDelayMs,
        },
      });

      throw error;
    }
  } catch (error) {
    if (
      transactionOpen
    ) {
      await client.query(
        'ROLLBACK',
      );
    }

    throw error;
  } finally {
    client.release();
  }
}