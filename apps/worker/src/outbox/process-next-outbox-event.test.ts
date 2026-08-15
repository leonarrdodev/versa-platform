import {
  PRODUCT_CREATED_EVENT_NAME,
} from '@versa/event-contracts';

import type {
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

import type {
  OutboxRetryPolicy,
} from './retry-policy.js';

const EVENT_ID =
  '11111111-1111-4111-8111-111111111111';

const TENANT_ID =
  '22222222-2222-4222-8222-222222222222';

const PRODUCT_ID =
  '33333333-3333-4333-8333-333333333333';

const CATEGORY_ID =
  '44444444-4444-4444-8444-444444444444';

const CORRELATION_ID =
  '55555555-5555-4555-8555-555555555555';

const EXECUTION_ID =
  '66666666-6666-4666-8666-666666666666';

const retryPolicy:
OutboxRetryPolicy = {
  maxAttempts:
    5,

  baseDelayMs:
    1_000,

  maxDelayMs:
    60_000,
};

const idGenerator:
IdGenerator = {
  generate() {
    return parseUuid(
      EXECUTION_ID,
    );
  },
};

const logger:
Logger = {
  log() {},

  debug() {},

  info() {},

  warn() {},

  error() {},
};

const monotonicClock:
MonotonicClock = {
  nowMs() {
    return 100;
  },
};

function createValidEvent():
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
      1,

    payload: {
      productId:
        PRODUCT_ID,

      sku:
        'TEST-001',

      name:
        'Produto de teste',

      categoryId:
        CATEGORY_ID,

      createdAt:
        '2026-08-15T00:00:00.000Z',
    },

    occurredAt:
      new Date(
        '2026-08-15T00:00:00.000Z',
      ),

    processingAttempts:
      0,
  };
}

interface RecordedQuery {
  readonly sql:
    string;

  readonly values?:
    readonly unknown[];
}

function createDatabaseMocks(
  selectedEvent:
    OutboxEventRow |
    undefined,
): {
  readonly pool:
    Pool;

  readonly client:
    PoolClient;

  readonly queries:
    RecordedQuery[];
} {
  const queries:
    RecordedQuery[] = [];

  const query =
    vi.fn(
      async (
        sql: string,
        values?:
          readonly unknown[],
      ) => {
        queries.push({
          sql,

          ...(values === undefined
            ? {}
            : {
                values,
              }),
        });

        if (
          sql.includes(
            'FROM event_outbox',
          )
        ) {
          return {
            rows:
              selectedEvent ===
              undefined
                ? []
                : [
                    selectedEvent,
                  ],
          };
        }

        return {
          rows: [],
        };
      },
    );

  const client = {
    query,

    release:
      vi.fn(),
  } as unknown as PoolClient;

  const pool = {
    connect:
      vi.fn(
        async () =>
          client,
      ),
  } as unknown as Pool;

  return {
    pool,
    client,
    queries,
  };
}

function findQuery(
  queries:
    readonly RecordedQuery[],

  fragment:
    string,
): RecordedQuery |
undefined {
  return queries.find(
    (query) =>
      query.sql.includes(
        fragment,
      ),
  );
}

describe(
  'processNextOutboxEvent',
  () => {
    it(
      'returns false when there is no pending event',
      async () => {
        const {
          pool,
          client,
          queries,
        } =
          createDatabaseMocks(
            undefined,
          );

        const processed =
          await processNextOutboxEvent({
            pool,

            idGenerator,

            logger,

            monotonicClock,

            retryPolicy: {
  maxAttempts: 5,
  baseDelayMs: 1_000,
  maxDelayMs: 60_000,
},
          });

        expect(
          processed,
        ).toBe(false);

        expect(
          queries.some(
            (query) =>
              query.sql.includes(
                'FROM event_outbox',
              ),
          ),
        ).toBe(true);

        expect(
          queries.some(
            (query) =>
              query.sql.includes(
                'COMMIT',
              ),
          ),
        ).toBe(true);

        expect(
          client.release,
        ).toHaveBeenCalledOnce();
      },
    );

    it(
      'processes and marks a valid event as completed',
      async () => {
        const event =
          createValidEvent();

        const {
          pool,
          client,
          queries,
        } =
          createDatabaseMocks(
            event,
          );

        const processed =
          await processNextOutboxEvent({
            pool,

            idGenerator,

            logger,

            monotonicClock,

            retryPolicy,
          });

        expect(
          processed,
        ).toBe(true);

        /*
         * A projeção do ProductCreated
         * deve ser escrita.
         */
        const projectionQuery =
          findQuery(
            queries,
            'INSERT INTO product_read_model',
          );

        expect(
          projectionQuery,
        ).toBeDefined();

        /*
         * Depois do processamento,
         * o evento deve ser marcado
         * como concluído.
         */
        const completedQuery =
          queries.find(
            (query) =>
              query.sql.includes(
                'UPDATE event_outbox',
              ) &&
              query.sql.includes(
                'processed_at = now()',
              ),
          );

        expect(
          completedQuery,
        ).toBeDefined();

        expect(
          completedQuery?.sql,
        ).toContain(
          'processing_attempts',
        );

        expect(
          completedQuery?.sql,
        ).toContain(
          'last_error = NULL',
        );

        expect(
          completedQuery?.sql,
        ).toContain(
          'next_attempt_at = NULL',
        );

        expect(
          completedQuery?.values,
        ).toEqual([
          EVENT_ID,
        ]);

        expect(
          queries.some(
            (query) =>
              query.sql.includes(
                'COMMIT',
              ),
          ),
        ).toBe(true);

        expect(
          client.release,
        ).toHaveBeenCalledOnce();
      },
    );

    it(
      'records the failure and schedules a retry without marking the event as processed',
      async () => {
        const event: OutboxEventRow = {
          ...createValidEvent(),

          eventName:
            'UnsupportedEvent',
        };

        const {
          pool,
          client,
          queries,
        } =
          createDatabaseMocks(
            event,
          );

        await expect(
          processNextOutboxEvent({
            pool,

            idGenerator,

            logger,

            monotonicClock,

            retryPolicy,
          }),
        ).rejects.toThrow(
          'Evento não suportado: UnsupportedEvent',
        );

        /*
         * Como foi a primeira falha,
         * ainda não deve ir para
         * dead-letter.
         */
        const failureQuery =
          queries.find(
            (query) =>
              query.sql.includes(
                'UPDATE event_outbox',
              ) &&
              query.sql.includes(
                'next_attempt_at',
              ) &&
              query.sql.includes(
                "interval '1 millisecond'",
              ),
          );

        expect(
          failureQuery,
        ).toBeDefined();

        expect(
          failureQuery?.sql,
        ).toContain(
          'processing_attempts',
        );

        expect(
          failureQuery?.sql,
        ).toContain(
          'last_error = $2',
        );

        expect(
          failureQuery?.sql,
        ).not.toContain(
          'processed_at = now()',
        );

        expect(
          failureQuery?.values,
        ).toEqual([
          EVENT_ID,

          'Evento não suportado: UnsupportedEvent',

          1_000,
        ]);

        /*
         * O SAVEPOINT precisa ser
         * revertido antes de registrar
         * a falha na própria outbox.
         */
        expect(
          queries.some(
            (query) =>
              query.sql.includes(
                'ROLLBACK TO SAVEPOINT event_processing',
              ),
          ),
        ).toBe(true);

        /*
         * O registro do retry deve
         * sobreviver, portanto a
         * transação termina em COMMIT.
         */
        expect(
          queries.some(
            (query) =>
              query.sql.includes(
                'COMMIT',
              ),
          ),
        ).toBe(true);

        expect(
          client.release,
        ).toHaveBeenCalledOnce();
      },
    );
  },
);