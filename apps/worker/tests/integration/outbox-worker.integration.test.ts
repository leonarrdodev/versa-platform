import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  Logger,
} from '@versa/observability';

import {
  PerformanceMonotonicClock,
} from '@versa/observability';

import {
  RandomUuidGenerator,
} from '@versa/shared-kernel';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import type {
  Pool,
} from 'pg';

import {
  env,
} from '../../src/config/env.js';

import {
  processNextOutboxEvent,
} from '../../src/outbox/process-next-outbox-event.js';

const logger: Logger = {
  log() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
};

let pool: Pool;

beforeAll(() => {
  pool = createDatabasePool(
    env.database,
  );
});

afterAll(async () => {
  await pool.end();
});

async function cleanupEvent(
  eventId: string,
): Promise<void> {
  await pool.query(
    `
      DELETE FROM product_read_model
      WHERE source_event_id = $1
    `,
    [
      eventId,
    ],
  );

  await pool.query(
    `
      DELETE FROM event_outbox
      WHERE event_id = $1
    `,
    [
      eventId,
    ],
  );
}

describe(
  'Outbox worker PostgreSQL integration',
  () => {
    it(
      'projects a ProductCreated and remains idempotent when reprocessed',
      async () => {
        const eventId =
          randomUUID();

        const tenantId =
          randomUUID();

        const productId =
          randomUUID();

        const categoryId =
          randomUUID();

        const correlationId =
          randomUUID();

        await cleanupEvent(
          eventId,
        );

        try {
          await pool.query(
            `
              INSERT INTO event_outbox (
                event_id,
                tenant_id,
                correlation_id,
                causation_id,
                aggregate_type,
                aggregate_id,
                event_name,
                event_version,
                payload,
                occurred_at,
                created_at
              )
              VALUES (
                $1,
                $2,
                $3,
                NULL,
                'Product',
                $4,
                $5,
                $6,
                $7,
                now(),
                '2000-01-01T00:00:00Z'
              )
            `,
            [
              eventId,
              tenantId,
              correlationId,
              productId,
              PRODUCT_CREATED_EVENT_NAME,
              PRODUCT_CREATED_EVENT_VERSION,

              JSON.stringify({
                productId,

                sku:
                  `INTEGRATION-${productId}`,

                name:
                  'Produto Integration Test',

                categoryId,

                createdAt:
                  '2026-08-09T03:00:00.000Z',
              }),
            ],
          );

          const dependencies = {
            pool,

            idGenerator:
              new RandomUuidGenerator(),

            logger,

            monotonicClock:
              new PerformanceMonotonicClock(),
          };

          const firstResult =
            await processNextOutboxEvent(
              dependencies,
            );

          expect(firstResult)
            .toBe(true);

          const firstProjection =
            await pool.query<{
              count: number;
            }>(
              `
                SELECT
                  count(*)::int
                    AS count
                FROM product_read_model
                WHERE source_event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            firstProjection.rows[0]?.count,
          ).toBe(1);

          const firstOutbox =
            await pool.query<{
              processingAttempts:
                number;

              processedAt:
                Date | null;

              lastError:
                string | null;
            }>(
              `
                SELECT
                  processing_attempts
                    AS "processingAttempts",

                  processed_at
                    AS "processedAt",

                  last_error
                    AS "lastError"

                FROM event_outbox
                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            firstOutbox
              .rows[0]
              ?.processingAttempts,
          ).toBe(1);

          expect(
            firstOutbox
              .rows[0]
              ?.processedAt,
          ).not.toBeNull();

          expect(
            firstOutbox
              .rows[0]
              ?.lastError,
          ).toBeNull();

          /*
           * Simulamos redelivery:
           * o mesmo evento volta a ficar pendente.
           */
          await pool.query(
            `
              UPDATE event_outbox
              SET processed_at = NULL
              WHERE event_id = $1
            `,
            [
              eventId,
            ],
          );

          const secondResult =
            await processNextOutboxEvent(
              dependencies,
            );

          expect(secondResult)
            .toBe(true);

          const secondProjection =
            await pool.query<{
              count: number;
            }>(
              `
                SELECT
                  count(*)::int
                    AS count
                FROM product_read_model
                WHERE source_event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            secondProjection
              .rows[0]
              ?.count,
          ).toBe(1);

          const secondOutbox =
            await pool.query<{
              processingAttempts:
                number;
            }>(
              `
                SELECT
                  processing_attempts
                    AS "processingAttempts"

                FROM event_outbox
                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            secondOutbox
              .rows[0]
              ?.processingAttempts,
          ).toBe(2);
        } finally {
          await cleanupEvent(
            eventId,
          );
        }
      },
    );

    it(
      'records a real processing failure without losing the event',
      async () => {
        const eventId =
          randomUUID();

        const tenantId =
          randomUUID();

        const productId =
          randomUUID();

        const correlationId =
          randomUUID();

        await cleanupEvent(
          eventId,
        );

        try {
          await pool.query(
            `
              INSERT INTO event_outbox (
                event_id,
                tenant_id,
                correlation_id,
                causation_id,
                aggregate_type,
                aggregate_id,
                event_name,
                event_version,
                payload,
                occurred_at,
                created_at
              )
              VALUES (
                $1,
                $2,
                $3,
                NULL,
                'Product',
                $4,
                'UnsupportedIntegrationEvent',
                1,
                '{}'::jsonb,
                now(),
                '2000-01-02T00:00:00Z'
              )
            `,
            [
              eventId,
              tenantId,
              correlationId,
              productId,
            ],
          );

          await expect(
            processNextOutboxEvent({
              pool,

              idGenerator:
                new RandomUuidGenerator(),

              logger,

              monotonicClock:
                new PerformanceMonotonicClock(),
            }),
          ).rejects.toThrow(
            'Evento não suportado: UnsupportedIntegrationEvent',
          );

          const result =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;

              lastError:
                string | null;
            }>(
              `
                SELECT
                  processed_at
                    AS "processedAt",

                  processing_attempts
                    AS "processingAttempts",

                  last_error
                    AS "lastError"

                FROM event_outbox
                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          const row =
            result.rows[0];

          expect(row)
            .toBeDefined();

          expect(
            row?.processedAt,
          ).toBeNull();

          expect(
            row?.processingAttempts,
          ).toBe(1);

          expect(
            row?.lastError,
          ).toBe(
            'Evento não suportado: UnsupportedIntegrationEvent',
          );
        } finally {
          await cleanupEvent(
            eventId,
          );
        }
      },
    );
  },
);