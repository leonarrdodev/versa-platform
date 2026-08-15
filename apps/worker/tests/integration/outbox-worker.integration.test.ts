import {
  randomUUID,
} from 'node:crypto';

import {
  PRODUCT_CREATED_EVENT_NAME,
  PRODUCT_CREATED_EVENT_VERSION,
} from '@versa/event-contracts';

import {
  createDatabasePool,
} from '@versa/database';

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

import {
  env,
} from '../../src/config/env.js';

import {
  processNextOutboxEvent,
} from '../../src/outbox/process-next-outbox-event.js';

const logger:
Logger = {
  log() {},

  debug() {},

  info() {},

  warn() {},

  error() {},
};

const retryPolicy = {
  maxAttempts:
    5,

  baseDelayMs:
    1_000,

  maxDelayMs:
    60_000,
} as const;

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

const idGenerator =
  new RandomUuidGenerator();

const monotonicClock =
  new PerformanceMonotonicClock();

beforeAll(
  () => {
    pool =
      createDatabasePool(
        env.database,
      );
  },
);

afterAll(
  async () => {
    await pool.end();
  },
);

async function cleanupEvent(
  eventId: string,
): Promise<void> {
  /*
   * A projection referencia o
   * source_event_id, então ela deve
   * ser removida antes da outbox.
   */
  await pool.query(
    `
      DELETE
      FROM product_read_model
      WHERE source_event_id = $1
    `,
    [
      eventId,
    ],
  );

  await pool.query(
    `
      DELETE
      FROM event_outbox
      WHERE event_id = $1
    `,
    [
      eventId,
    ],
  );
}

describe(
  'Outbox worker integration',
  () => {
    it(
      'projects ProductCreated and remains idempotent when the same event is reprocessed',
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

        try {
          /*
           * Insere um evento real
           * diretamente na outbox.
           *
           * next_attempt_at antigo
           * garante que será elegível
           * imediatamente.
           */
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
                created_at,
                next_attempt_at
              )
              VALUES (
                $1,
                $2,
                $3,
                NULL,
                $4,
                $5,
                $6,
                $7,
                $8::jsonb,
                $9,
                '1900-01-01T00:00:00Z',
                '1900-01-01T00:00:00Z'
              )
            `,
            [
              eventId,

              tenantId,

              correlationId,

              'Product',

              productId,

              PRODUCT_CREATED_EVENT_NAME,

              PRODUCT_CREATED_EVENT_VERSION,

              JSON.stringify({
                productId,

                sku:
                  'INTEGRATION-001',

                name:
                  'Produto Integration',

                categoryId,

                createdAt:
                  '2026-08-15T00:00:00.000Z',
              }),

              '2026-08-15T00:00:00.000Z',
            ],
          );

          /*
           * Primeira execução.
           */
          const firstProcessed =
            await processNextOutboxEvent({
              pool,

              idGenerator,

              logger,

              monotonicClock,

              retryPolicy,
            });

          expect(
            firstProcessed,
          ).toBe(true);

          /*
           * A projection deve existir
           * exatamente uma vez.
           */
          const firstProjection =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM product_read_model

                WHERE
                  source_event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            Number(
              firstProjection
                .rows[0]
                ?.count,
            ),
          ).toBe(1);

          const firstState =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;

              lastError:
                string | null;

              nextAttemptAt:
                Date | null;

              deadLetteredAt:
                Date | null;
            }>(
              `
                SELECT
                  processed_at
                    AS "processedAt",

                  processing_attempts
                    AS "processingAttempts",

                  last_error
                    AS "lastError",

                  next_attempt_at
                    AS "nextAttemptAt",

                  dead_lettered_at
                    AS "deadLetteredAt"

                FROM event_outbox

                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            firstState
              .rows[0]
              ?.processedAt,
          ).not.toBeNull();

          expect(
            firstState
              .rows[0]
              ?.processingAttempts,
          ).toBe(1);

          expect(
            firstState
              .rows[0]
              ?.lastError,
          ).toBeNull();

          expect(
            firstState
              .rows[0]
              ?.nextAttemptAt,
          ).toBeNull();

          expect(
            firstState
              .rows[0]
              ?.deadLetteredAt,
          ).toBeNull();

          /*
           * Simulamos replay/requeue
           * do mesmo evento.
           *
           * Com a migration 0005,
           * processed_at não pode ser
           * zerado sozinho.
           */
          await pool.query(
            `
              UPDATE event_outbox
              SET
                processed_at = NULL,

                next_attempt_at =
                  '1900-01-01T00:00:00Z',

                dead_lettered_at = NULL

              WHERE event_id = $1
            `,
            [
              eventId,
            ],
          );

          const secondProcessed =
            await processNextOutboxEvent({
              pool,

              idGenerator,

              logger,

              monotonicClock,

              retryPolicy,
            });

          expect(
            secondProcessed,
          ).toBe(true);

          /*
           * O projector utiliza
           * source_event_id UNIQUE +
           * ON CONFLICT, portanto o
           * mesmo evento não duplica
           * a projection.
           */
          const secondProjection =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM product_read_model

                WHERE
                  source_event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            Number(
              secondProjection
                .rows[0]
                ?.count,
            ),
          ).toBe(1);

          const secondState =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;

              nextAttemptAt:
                Date | null;
            }>(
              `
                SELECT
                  processed_at
                    AS "processedAt",

                  processing_attempts
                    AS "processingAttempts",

                  next_attempt_at
                    AS "nextAttemptAt"

                FROM event_outbox

                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          expect(
            secondState
              .rows[0]
              ?.processedAt,
          ).not.toBeNull();

          expect(
            secondState
              .rows[0]
              ?.processingAttempts,
          ).toBe(2);

          expect(
            secondState
              .rows[0]
              ?.nextAttemptAt,
          ).toBeNull();
        } finally {
          await cleanupEvent(
            eventId,
          );
        }
      },
    );

    it(
      'records a failed event and schedules a retry without marking it as processed',
      async () => {
        const eventId =
          randomUUID();

        const tenantId =
          randomUUID();

        const aggregateId =
          randomUUID();

        const correlationId =
          randomUUID();

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
                created_at,
                next_attempt_at
              )
              VALUES (
                $1,
                $2,
                $3,
                NULL,
                $4,
                $5,
                $6,
                1,
                $7::jsonb,
                $8,
                '1900-01-01T00:00:00Z',
                '1900-01-01T00:00:00Z'
              )
            `,
            [
              eventId,

              tenantId,

              correlationId,

              'TestAggregate',

              aggregateId,

              'UnsupportedEvent',

              JSON.stringify({
                test:
                  true,
              }),

              '2026-08-15T00:00:00.000Z',
            ],
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

          const result =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;

              lastError:
                string | null;

              nextAttemptAt:
                Date | null;

              deadLetteredAt:
                Date | null;
            }>(
              `
                SELECT
                  processed_at
                    AS "processedAt",

                  processing_attempts
                    AS "processingAttempts",

                  last_error
                    AS "lastError",

                  next_attempt_at
                    AS "nextAttemptAt",

                  dead_lettered_at
                    AS "deadLetteredAt"

                FROM event_outbox

                WHERE event_id = $1
              `,
              [
                eventId,
              ],
            );

          const event =
            result.rows[0];

          expect(
            event,
          ).toBeDefined();

          expect(
            event?.processedAt,
          ).toBeNull();

          expect(
            event?.processingAttempts,
          ).toBe(1);

          expect(
            event?.lastError,
          ).toBe(
            'Evento não suportado: UnsupportedEvent',
          );

          /*
           * Após uma falha ainda
           * retryable, deve existir
           * uma próxima tentativa.
           */
          expect(
            event?.nextAttemptAt,
          ).not.toBeNull();

          /*
           * Primeira falha ainda
           * não é dead-letter.
           */
          expect(
            event?.deadLetteredAt,
          ).toBeNull();
        } finally {
          await cleanupEvent(
            eventId,
          );
        }
      },
    );
  },
);

it(
  'does not let a poison event block healthy events and dead-letters it after max attempts',
  async () => {
    const poisonEventId =
      randomUUID();

    const poisonTenantId =
      randomUUID();

    const poisonAggregateId =
      randomUUID();

    const poisonCorrelationId =
      randomUUID();

    const healthyEventId =
      randomUUID();

    const healthyTenantId =
      randomUUID();

    const healthyProductId =
      randomUUID();

    const healthyCategoryId =
      randomUUID();

    const healthyCorrelationId =
      randomUUID();

    const afterDeadLetterEventId =
      randomUUID();

    const afterDeadLetterTenantId =
      randomUUID();

    const afterDeadLetterProductId =
      randomUUID();

    const afterDeadLetterCategoryId =
      randomUUID();

    const afterDeadLetterCorrelationId =
      randomUUID();

    /*
     * Usamos 3 tentativas neste teste
     * para provar o ciclo completo sem
     * precisar executar 5 falhas.
     */
    const poisonRetryPolicy = {
      maxAttempts:
        3,

      baseDelayMs:
        1_000,

      maxDelayMs:
        60_000,
    } as const;

    try {
      /*
       * Evento A:
       *
       * propositalmente inválido e
       * mais antigo que todos.
       */
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
            created_at,
            next_attempt_at
          )
          VALUES (
            $1,
            $2,
            $3,
            NULL,
            $4,
            $5,
            $6,
            1,
            $7::jsonb,
            $8,
            '1800-01-01T00:00:00Z',
            '1800-01-01T00:00:00Z'
          )
        `,
        [
          poisonEventId,

          poisonTenantId,

          poisonCorrelationId,

          'PoisonAggregate',

          poisonAggregateId,

          'UnsupportedPoisonEvent',

          JSON.stringify({
            poison:
              true,
          }),

          '2026-08-15T00:00:00.000Z',
        ],
      );

      /*
       * Evento B:
       *
       * válido, porém originalmente
       * está atrás do evento quebrado.
       */
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
            created_at,
            next_attempt_at
          )
          VALUES (
            $1,
            $2,
            $3,
            NULL,
            $4,
            $5,
            $6,
            $7,
            $8::jsonb,
            $9,
            '1900-01-01T00:00:00Z',
            '1900-01-01T00:00:00Z'
          )
        `,
        [
          healthyEventId,

          healthyTenantId,

          healthyCorrelationId,

          'Product',

          healthyProductId,

          PRODUCT_CREATED_EVENT_NAME,

          PRODUCT_CREATED_EVENT_VERSION,

          JSON.stringify({
            productId:
              healthyProductId,

            sku:
              `HEALTHY-${healthyEventId}`,

            name:
              'Produto saudável',

            categoryId:
              healthyCategoryId,

            createdAt:
              '2026-08-15T00:00:00.000Z',
          }),

          '2026-08-15T00:00:00.000Z',
        ],
      );

      /*
       * 1ª tentativa:
       *
       * A é o evento mais antigo,
       * portanto será selecionado.
       *
       * Ele falha e recebe um
       * next_attempt_at futuro.
       */
      await expect(
        processNextOutboxEvent({
          pool,

          idGenerator,

          logger,

          monotonicClock,

          retryPolicy:
            poisonRetryPolicy,
        }),
      ).rejects.toThrow(
        'Evento não suportado: UnsupportedPoisonEvent',
      );

      const poisonAfterFirstFailure =
        await pool.query<{
          processingAttempts:
            number;

          processedAt:
            Date | null;

          nextAttemptAt:
            Date | null;

          deadLetteredAt:
            Date | null;
        }>(
          `
            SELECT
              processing_attempts
                AS "processingAttempts",

              processed_at
                AS "processedAt",

              next_attempt_at
                AS "nextAttemptAt",

              dead_lettered_at
                AS "deadLetteredAt"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            poisonEventId,
          ],
        );

      expect(
        poisonAfterFirstFailure
          .rows[0]
          ?.processingAttempts,
      ).toBe(1);

      expect(
        poisonAfterFirstFailure
          .rows[0]
          ?.processedAt,
      ).toBeNull();

      expect(
        poisonAfterFirstFailure
          .rows[0]
          ?.nextAttemptAt,
      ).not.toBeNull();

      expect(
        poisonAfterFirstFailure
          .rows[0]
          ?.deadLetteredAt,
      ).toBeNull();

      /*
       * Agora o poison event está
       * aguardando seu backoff.
       *
       * O evento B continua pronto.
       *
       * O worker deve IGNORAR A
       * temporariamente e processar B.
       */
      const healthyProcessed =
        await processNextOutboxEvent({
          pool,

          idGenerator,

          logger,

          monotonicClock,

          retryPolicy:
            poisonRetryPolicy,
        });

      expect(
        healthyProcessed,
      ).toBe(true);

      const healthyState =
        await pool.query<{
          processedAt:
            Date | null;
        }>(
          `
            SELECT
              processed_at
                AS "processedAt"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            healthyEventId,
          ],
        );

      expect(
        healthyState
          .rows[0]
          ?.processedAt,
      ).not.toBeNull();

      const healthyProjection =
        await pool.query<{
          count:
            string;
        }>(
          `
            SELECT
              count(*)::text
                AS count

            FROM product_read_model

            WHERE source_event_id = $1
          `,
          [
            healthyEventId,
          ],
        );

      expect(
        Number(
          healthyProjection
            .rows[0]
            ?.count,
        ),
      ).toBe(1);

      /*
       * Para o teste não precisar
       * esperar fisicamente pelo
       * backoff, tornamos A novamente
       * elegível.
       */
      await pool.query(
        `
          UPDATE event_outbox
          SET
            next_attempt_at =
              '1800-01-01T00:00:00Z'

          WHERE event_id = $1
        `,
        [
          poisonEventId,
        ],
      );

      /*
       * 2ª tentativa do poison.
       */
      await expect(
        processNextOutboxEvent({
          pool,

          idGenerator,

          logger,

          monotonicClock,

          retryPolicy:
            poisonRetryPolicy,
        }),
      ).rejects.toThrow(
        'Evento não suportado: UnsupportedPoisonEvent',
      );

      const poisonAfterSecondFailure =
        await pool.query<{
          processingAttempts:
            number;

          nextAttemptAt:
            Date | null;

          deadLetteredAt:
            Date | null;
        }>(
          `
            SELECT
              processing_attempts
                AS "processingAttempts",

              next_attempt_at
                AS "nextAttemptAt",

              dead_lettered_at
                AS "deadLetteredAt"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            poisonEventId,
          ],
        );

      expect(
        poisonAfterSecondFailure
          .rows[0]
          ?.processingAttempts,
      ).toBe(2);

      expect(
        poisonAfterSecondFailure
          .rows[0]
          ?.nextAttemptAt,
      ).not.toBeNull();

      expect(
        poisonAfterSecondFailure
          .rows[0]
          ?.deadLetteredAt,
      ).toBeNull();

      /*
       * Tornamos A elegível para sua
       * terceira e última tentativa.
       */
      await pool.query(
        `
          UPDATE event_outbox
          SET
            next_attempt_at =
              '1800-01-01T00:00:00Z'

          WHERE event_id = $1
        `,
        [
          poisonEventId,
        ],
      );

      /*
       * 3ª tentativa:
       *
       * maxAttempts = 3.
       *
       * Portanto agora o evento deve
       * entrar em dead-letter.
       */
      await expect(
        processNextOutboxEvent({
          pool,

          idGenerator,

          logger,

          monotonicClock,

          retryPolicy:
            poisonRetryPolicy,
        }),
      ).rejects.toThrow(
        'Evento não suportado: UnsupportedPoisonEvent',
      );

      const deadLetterState =
        await pool.query<{
          processingAttempts:
            number;

          processedAt:
            Date | null;

          nextAttemptAt:
            Date | null;

          deadLetteredAt:
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

              next_attempt_at
                AS "nextAttemptAt",

              dead_lettered_at
                AS "deadLetteredAt",

              last_error
                AS "lastError"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            poisonEventId,
          ],
        );

      const deadLetter =
        deadLetterState.rows[0];

      expect(
        deadLetter
          ?.processingAttempts,
      ).toBe(3);

      expect(
        deadLetter
          ?.processedAt,
      ).toBeNull();

      expect(
        deadLetter
          ?.nextAttemptAt,
      ).toBeNull();

      expect(
        deadLetter
          ?.deadLetteredAt,
      ).not.toBeNull();

      expect(
        deadLetter
          ?.lastError,
      ).toBe(
        'Evento não suportado: UnsupportedPoisonEvent',
      );

      /*
       * Agora vamos provar que um
       * evento em dead-letter realmente
       * desapareceu da fila ativa.
       *
       * Inserimos um novo evento
       * saudável.
       */
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
            created_at,
            next_attempt_at
          )
          VALUES (
            $1,
            $2,
            $3,
            NULL,
            $4,
            $5,
            $6,
            $7,
            $8::jsonb,
            $9,
            '1700-01-01T00:00:00Z',
            '1700-01-01T00:00:00Z'
          )
        `,
        [
          afterDeadLetterEventId,

          afterDeadLetterTenantId,

          afterDeadLetterCorrelationId,

          'Product',

          afterDeadLetterProductId,

          PRODUCT_CREATED_EVENT_NAME,

          PRODUCT_CREATED_EVENT_VERSION,

          JSON.stringify({
            productId:
              afterDeadLetterProductId,

            sku:
              `AFTER-DL-${afterDeadLetterEventId}`,

            name:
              'Produto após dead-letter',

            categoryId:
              afterDeadLetterCategoryId,

            createdAt:
              '2026-08-15T00:00:00.000Z',
          }),

          '2026-08-15T00:00:00.000Z',
        ],
      );

      const afterDeadLetterProcessed =
        await processNextOutboxEvent({
          pool,

          idGenerator,

          logger,

          monotonicClock,

          retryPolicy:
            poisonRetryPolicy,
        });

      expect(
        afterDeadLetterProcessed,
      ).toBe(true);

      const afterDeadLetterState =
        await pool.query<{
          processedAt:
            Date | null;
        }>(
          `
            SELECT
              processed_at
                AS "processedAt"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            afterDeadLetterEventId,
          ],
        );

      expect(
        afterDeadLetterState
          .rows[0]
          ?.processedAt,
      ).not.toBeNull();

      /*
       * E A deve permanecer exatamente
       * com três tentativas.
       *
       * Se o worker tivesse voltado a
       * selecioná-lo, esse número teria
       * aumentado.
       */
      const poisonFinalState =
        await pool.query<{
          processingAttempts:
            number;

          deadLetteredAt:
            Date | null;
        }>(
          `
            SELECT
              processing_attempts
                AS "processingAttempts",

              dead_lettered_at
                AS "deadLetteredAt"

            FROM event_outbox

            WHERE event_id = $1
          `,
          [
            poisonEventId,
          ],
        );

      expect(
        poisonFinalState
          .rows[0]
          ?.processingAttempts,
      ).toBe(3);

      expect(
        poisonFinalState
          .rows[0]
          ?.deadLetteredAt,
      ).not.toBeNull();
    } finally {
      await cleanupEvent(
        poisonEventId,
      );

      await cleanupEvent(
        healthyEventId,
      );

      await cleanupEvent(
        afterDeadLetterEventId,
      );
    }
  },
);