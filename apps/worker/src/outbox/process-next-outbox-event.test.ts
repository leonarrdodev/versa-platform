import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import type {
  Logger,
  MonotonicClock,
} from '@versa/observability';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  IdGenerator,
} from '@versa/shared-kernel';

import type {
  Pool,
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import type {
  OutboxEventRow,
} from './outbox-event-row.js';

import {
  processNextOutboxEvent,
} from './process-next-outbox-event.js';

const EVENT_ID =
  '11111111-1111-4111-8111-111111111111';

const TENANT_ID =
  '22222222-2222-4222-8222-222222222222';

const PRODUCT_ID =
  '33333333-3333-4333-8333-333333333333';

const CORRELATION_ID =
  '44444444-4444-4444-8444-444444444444';

const EXECUTION_ID =
  parseUuid(
    '55555555-5555-4555-8555-555555555555',
  );

function createEvent():
OutboxEventRow {
  return {
    eventId:
      EVENT_ID,

    tenantId:
      TENANT_ID,

    correlationId:
      CORRELATION_ID,

    causationId:
      null,

    aggregateType:
      'Product',

    aggregateId:
      PRODUCT_ID,

    eventName:
      PRODUCT_CREATED_EVENT_NAME,

    eventVersion:
      PRODUCT_CREATED_EVENT_VERSION,

    payload: {
      productId:
        PRODUCT_ID,

      sku:
        'BLUSA-001',

      name:
        'Blusa Canelada Feminina',

      categoryId:
        '66666666-6666-4666-8666-666666666666',

      createdAt:
        '2026-08-09T03:00:00.000Z',
    },

    occurredAt:
      new Date(
        '2026-08-09T03:00:00.000Z',
      ),

    processingAttempts: 0,
  };
}

function createLogger(): Logger {
  return {
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

const idGenerator:
IdGenerator = {
  generate() {
    return EXECUTION_ID;
  },
};

describe(
  'processNextOutboxEvent',
  () => {
    it(
      'returns false when there is no pending event',
      async () => {
        const query = vi.fn(
  async (
    sql: string,
    _values?: readonly unknown[],
  ) => {
            if (
              sql.includes(
                'FROM event_outbox',
              )
            ) {
              return {
                rows: [],
              };
            }

            return {
              rows: [],
            };
          },
        );

        const release =
          vi.fn();

        const client = {
          query,
          release,
        } as unknown as PoolClient;

        const pool = {
          connect:
            vi.fn()
              .mockResolvedValue(
                client,
              ),
        } as unknown as Pool;

        const result =
          await processNextOutboxEvent({
            pool,
            idGenerator,
            logger:
              createLogger(),

            monotonicClock: {
              nowMs: () => 0,
            },
          });

        expect(result)
          .toBe(false);

        expect(release)
          .toHaveBeenCalledOnce();
      },
    );

    it(
      'processes and marks a valid event as completed',
      async () => {
        const event =
          createEvent();

       const query = vi.fn(
  async (
    sql: string,
    _values?: readonly unknown[],
  ) => {
            if (
              sql.includes(
                'FROM event_outbox',
              )
            ) {
              return {
                rows: [
                  event,
                ],
              };
            }

            return {
              rows: [],
              rowCount: 1,
            };
          },
        );

        const release =
          vi.fn();

        const client = {
          query,
          release,
        } as unknown as PoolClient;

        const pool = {
          connect:
            vi.fn()
              .mockResolvedValue(
                client,
              ),
        } as unknown as Pool;

        const logger =
          createLogger();

        const nowMs =
          vi.fn()
            .mockReturnValueOnce(
              100,
            )
            .mockReturnValueOnce(
              125,
            );

        const monotonicClock:
        MonotonicClock = {
          nowMs,
        };

        const result =
          await processNextOutboxEvent({
            pool,
            idGenerator,
            logger,
            monotonicClock,
          });

        expect(result)
          .toBe(true);

        expect(logger.info)
          .toHaveBeenNthCalledWith(
            1,
            expect.objectContaining({
              event:
                'outbox.processing.started',

              context: {
                correlationId:
                  parseUuid(
                    CORRELATION_ID,
                  ),

                executionId:
                  EXECUTION_ID,

                causationId:
                  parseUuid(
                    EVENT_ID,
                  ),
              },
            }),
          );

        expect(logger.info)
          .toHaveBeenNthCalledWith(
            2,
            expect.objectContaining({
              event:
                'outbox.processing.completed',

              durationMs: 25,
            }),
          );

        const allSql =
          query.mock.calls
            .map(
              ([sql]) =>
                String(sql),
            )
            .join('\n');

        expect(allSql)
          .toContain(
            'INSERT INTO product_read_model',
          );

        expect(allSql)
          .toContain(
            'processed_at = now()',
          );

        expect(allSql)
          .toContain(
            'COMMIT',
          );

        expect(release)
          .toHaveBeenCalledOnce();
      },
    );

    it(
      'records the failure without marking the event as processed',
      async () => {
        const event = {
          ...createEvent(),

          eventName:
            'UnsupportedEvent',
        };

        const query = vi.fn(
  async (
    sql: string,
    _values?: readonly unknown[],
  ) => {
            if (
              sql.includes(
                'FROM event_outbox',
              )
            ) {
              return {
                rows: [
                  event,
                ],
              };
            }

            return {
              rows: [],
              rowCount: 1,
            };
          },
        );

        const release =
          vi.fn();

        const client = {
          query,
          release,
        } as unknown as PoolClient;

        const pool = {
          connect:
            vi.fn()
              .mockResolvedValue(
                client,
              ),
        } as unknown as Pool;

        const logger =
          createLogger();

        const monotonicClock:
        MonotonicClock = {
          nowMs:
            vi.fn()
              .mockReturnValueOnce(
                100,
              )
              .mockReturnValueOnce(
                130,
              ),
        };

        await expect(
          processNextOutboxEvent({
            pool,
            idGenerator,
            logger,
            monotonicClock,
          }),
        ).rejects.toThrow(
          'Evento não suportado: UnsupportedEvent',
        );

        const failureUpdate =
          query.mock.calls.find(
            ([sql]) =>
              String(sql).includes(
                'last_error = $2',
              ),
          );

        expect(failureUpdate)
          .toBeDefined();

        if (
          failureUpdate ===
          undefined
        ) {
          throw new Error(
            'Expected failure update',
          );
        }

        const [
          failureSql,
          failureValues,
        ] = failureUpdate;

        expect(failureSql)
          .toContain(
            'processing_attempts',
          );

        expect(failureSql)
          .toContain(
            'last_error',
          );

        expect(failureSql)
          .not
          .toContain(
            'processed_at = now()',
          );

        expect(
          failureValues,
        ).toEqual([
          EVENT_ID,
          'Evento não suportado: UnsupportedEvent',
        ]);

        expect(logger.error)
          .toHaveBeenCalledWith(
            expect.objectContaining({
              event:
                'outbox.processing.failed',

              durationMs: 30,
            }),
          );

        expect(release)
          .toHaveBeenCalledOnce();
      },
    );
  },
);