import {
  randomUUID,
} from 'node:crypto';

import {
  CreateProductHandler,
  GetProductByIdHandler,
  PostgresCatalogUnitOfWork,
  PostgresProductReadRepository,
} from '@versa/catalog';

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
  SystemClock,
} from '@versa/shared-kernel';

import type {
  FastifyInstance,
} from 'fastify';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildApp,
} from '../../src/app.js';

import {
  env,
} from '../../src/config/env.js';

import {
  processNextOutboxEvent,
} from '../../../worker/src/outbox/process-next-outbox-event.js';

const logger: Logger = {
  log() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
};

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

let app: FastifyInstance;

const idGenerator =
  new RandomUuidGenerator();

const monotonicClock =
  new PerformanceMonotonicClock();

beforeAll(
  async () => {
    pool = createDatabasePool(
      env.database,
    );

    const clock =
      new SystemClock();

    const unitOfWork =
      new PostgresCatalogUnitOfWork(
        pool,
      );

    const createProductHandler =
      new CreateProductHandler({
        clock,
        idGenerator,
        unitOfWork,
      });

    const productReadRepository =
      new PostgresProductReadRepository(
        pool,
      );

    const getProductByIdHandler =
      new GetProductByIdHandler(
        productReadRepository,
      );

    app = buildApp({
      logger: false,

      catalog: {
        createProductHandler,
        getProductByIdHandler,
        idGenerator,
        logger,
        monotonicClock,
      },
    });

    await app.ready();
  },
);

afterAll(
  async () => {
    await app.close();
    await pool.end();
  },
);

describe(
  'Product vertical slice',
  () => {
    it(
      'creates, projects and reads a product',
      async () => {
        const tenantId =
          randomUUID();

        const categoryId =
          randomUUID();

        const sku =
          `E2E-${randomUUID()}`;

        const expectedSku =
          sku.toUpperCase();

        try {
          /*
           * WRITE SIDE
           */
          const postResponse =
            await app.inject({
              method: 'POST',

              url:
                '/products',

              headers: {
                'x-tenant-id':
                  tenantId,
              },

              payload: {
                sku,

                name:
                  'Produto E2E',

                categoryId,
              },
            });

          expect(
            postResponse.statusCode,
          ).toBe(201);

          const created =
            postResponse.json<{
              id: string;
              tenantId: string;
              sku: string;
              status: string;
            }>();

          expect(
            created.tenantId,
          ).toBe(tenantId);

          expect(
            created.sku,
          ).toBe(
            expectedSku,
          );

          expect(
            created.status,
          ).toBe('draft');

          /*
           * O evento deve existir,
           * mas ainda não ter sido
           * projetado.
           */
          const eventResult =
            await pool.query<{
              eventId: string;
              processedAt:
                Date | null;
            }>(
              `
                SELECT
                  event_id
                    AS "eventId",

                  processed_at
                    AS "processedAt"

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND aggregate_id = $2

                LIMIT 1
              `,
              [
                tenantId,
                created.id,
              ],
            );

          const event =
            eventResult.rows[0];

          expect(event)
            .toBeDefined();

          expect(
            event?.processedAt,
          ).toBeNull();

          /*
           * Antes do worker,
           * o read model ainda
           * não existe.
           */
          const beforeWorker =
            await app.inject({
              method: 'GET',

              url:
                `/products/${created.id}`,

              headers: {
                'x-tenant-id':
                  tenantId,
              },
            });

          expect(
            beforeWorker.statusCode,
          ).toBe(404);

          /*
           * Forçamos este evento
           * a ser o mais antigo
           * da fila.
           */
          await pool.query(
            `
              UPDATE event_outbox

              SET created_at =
                '1900-01-01T00:00:00Z'

              WHERE event_id = $1
            `,
            [
              event?.eventId,
            ],
          );

          /*
           * ASYNC SIDE
           */
          const processed =
            await processNextOutboxEvent({
              pool,
              idGenerator,
              logger,
              monotonicClock,
            });

          expect(processed)
            .toBe(true);

          /*
           * READ SIDE
           */
          const getResponse =
            await app.inject({
              method: 'GET',

              url:
                `/products/${created.id}`,

              headers: {
                'x-tenant-id':
                  tenantId,
              },
            });

          expect(
            getResponse.statusCode,
          ).toBe(200);

          const projected =
            getResponse.json<{
              id: string;
              tenantId: string;
              sku: string;
              name: string;
              categoryId: string;
              status: string;
              projectedAt: string;
            }>();

          expect(projected)
            .toEqual(
              expect.objectContaining({
                id:
                  created.id,

                tenantId,

                sku:
                  expectedSku,

                name:
                  'Produto E2E',

                categoryId,

                status:
                  'draft',
              }),
            );

          expect(
            projected.projectedAt,
          ).toEqual(
            expect.any(String),
          );

          /*
           * Confirma que o evento
           * foi realmente concluído.
           */
          const processedEvent =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;
            }>(
              `
                SELECT
                  processed_at
                    AS "processedAt",

                  processing_attempts
                    AS "processingAttempts"

                FROM event_outbox

                WHERE event_id = $1
              `,
              [
                event?.eventId,
              ],
            );

          expect(
            processedEvent
              .rows[0]
              ?.processedAt,
          ).not.toBeNull();

          expect(
            processedEvent
              .rows[0]
              ?.processingAttempts,
          ).toBe(1);

          /*
           * MULTI-TENANCY:
           * outro tenant não pode
           * enxergar o produto.
           */
          const wrongTenantResponse =
            await app.inject({
              method: 'GET',

              url:
                `/products/${created.id}`,

              headers: {
                'x-tenant-id':
                  randomUUID(),
              },
            });

          expect(
            wrongTenantResponse
              .statusCode,
          ).toBe(404);
        } finally {
          /*
           * Tenant aleatório exclusivo
           * deste teste torna a limpeza
           * segura.
           */
          await pool.query(
            `
              DELETE
              FROM product_read_model

              WHERE tenant_id = $1
            `,
            [
              tenantId,
            ],
          );

          await pool.query(
            `
              DELETE
              FROM event_outbox

              WHERE tenant_id = $1
            `,
            [
              tenantId,
            ],
          );

          await pool.query(
            `
              DELETE
              FROM products

              WHERE tenant_id = $1
            `,
            [
              tenantId,
            ],
          );
        }
      },
    );
  },
);