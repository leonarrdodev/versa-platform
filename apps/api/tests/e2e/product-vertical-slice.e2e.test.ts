import {
  randomUUID,
} from 'node:crypto';

import {
  CreateCategoryHandler,
  CreateProductHandler,
  GetCategoriesHandler,
  GetProductByIdHandler,
  GetProductsHandler,
  PostgresCatalogUnitOfWork,
  PostgresCategoryReadRepository,
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
  processNextOutboxEvent,
} from '../../../worker/src/outbox/process-next-outbox-event.js';

import {
  buildApp,
} from '../../src/app.js';

import {
  createIdentityComposition,
} from '../../src/composition/identity.js';

import {
  env,
} from '../../src/config/env.js';

import {
  cleanupAuthenticatedIdentity,
  createAuthenticatedIdentity,
} from './helpers/authenticated-identity.js';

import type {
  AuthenticatedIdentity,
} from './helpers/authenticated-identity.js';

import {
  cleanupTenantCatalog,
  createTestCategory,
} from './helpers/catalog-fixtures.js';

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

let app:
  FastifyInstance;

const idGenerator =
  new RandomUuidGenerator();

const monotonicClock =
  new PerformanceMonotonicClock();

beforeAll(
  async () => {
    pool =
      createDatabasePool(
        env.database,
      );

    const clock =
      new SystemClock();

    const unitOfWork =
      new PostgresCatalogUnitOfWork(
        pool,
      );

    const createCategoryHandler =
      new CreateCategoryHandler({
        clock,

        idGenerator,

        unitOfWork,
      });

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

      const categoryReadRepository =
  new PostgresCategoryReadRepository(
    pool,
  );

const getCategoriesHandler =
  new GetCategoriesHandler(
    categoryReadRepository,
  );

    const getProductByIdHandler =
      new GetProductByIdHandler(
        productReadRepository,
      );

    const getProductsHandler =
      new GetProductsHandler(
        productReadRepository,
      );

    const identity =
      createIdentityComposition(
        pool,
      );

    app =
      buildApp({
        logger:
          false,

        applicationLogger:
          logger,

        catalog: {
  createCategoryHandler,

  createProductHandler,

  getCategoriesHandler,

  getProductByIdHandler,

  getProductsHandler,

  idGenerator,

  logger,

  monotonicClock,
},

        identity: {
          signInHandler:
            identity.signInHandler,

          resolveSessionHandler:
            identity.resolveSessionHandler,

          revokeSessionHandler:
            identity.revokeSessionHandler,

          listAvailableTenantsHandler:
            identity.listAvailableTenantsHandler,

          setActiveTenantHandler:
            identity.setActiveTenantHandler,

          secureCookies:
            false,
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
      'creates, projects, reads and lists a product using the authenticated tenant',
      async () => {
        const sku =
          `E2E-${randomUUID()}`;

        const expectedSku =
          sku.toUpperCase();

        let identityA:
          AuthenticatedIdentity | null =
            null;

        let identityB:
          AuthenticatedIdentity | null =
            null;

        try {
          /*
           * Cria duas identidades reais,
           * cada uma pertencente a um
           * tenant diferente.
           */
          identityA =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-a',
            });

          identityB =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-b',
            });

          /*
           * Product agora referencia
           * uma Category real do mesmo
           * tenant.
           */
          const categoryId =
            await createTestCategory({
              pool,

              tenantId:
                identityA.tenantId,

              name:
                'Categoria Product E2E',
            });

          /*
           * 1. Cria o produto pela API
           * usando somente o cookie
           * autenticado.
           *
           * O tenant não é enviado
           * pelo cliente.
           */
          const postResponse =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identityA.cookie,
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
              id:
                string;

              tenantId:
                string;

              sku:
                string;

              status:
                string;
            }>();

          /*
           * O tenant persistido deve ser
           * exatamente o tenant resolvido
           * pela Session A.
           */
          expect(
            created.tenantId,
          ).toBe(
            identityA.tenantId,
          );

          expect(
            created.sku,
          ).toBe(
            expectedSku,
          );

          expect(
            created.status,
          ).toBe(
            'draft',
          );

          /*
           * 2. Confirma que o evento
           * foi escrito na outbox.
           */
          const eventResult =
            await pool.query<{
              eventId:
                string;

              processedAt:
                Date | null;

              nextAttemptAt:
                Date | null;
            }>(
              `
                SELECT
                  event_id
                    AS "eventId",

                  processed_at
                    AS "processedAt",

                  next_attempt_at
                    AS "nextAttemptAt"

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND aggregate_id = $2

                LIMIT 1
              `,
              [
                identityA.tenantId,

                created.id,
              ],
            );

          const event =
            eventResult.rows[0];

          expect(
            event,
          ).toBeDefined();

          expect(
            event?.processedAt,
          ).toBeNull();

          expect(
            event?.nextAttemptAt,
          ).not.toBeNull();

          /*
           * 3. Antes do worker,
           * a projection ainda
           * não existe.
           */
          const beforeWorker =
            await app.inject({
              method:
                'GET',

              url:
                `/products/${created.id}`,

              headers: {
                cookie:
                  identityA.cookie,
              },
            });

          expect(
            beforeWorker.statusCode,
          ).toBe(404);

          /*
           * Torna o ProductCreated
           * deste teste inequivocamente
           * elegível.
           */
          await pool.query(
            `
              UPDATE event_outbox

              SET
                next_attempt_at =
                  '1900-01-01T00:00:00Z',

                created_at =
                  '1900-01-01T00:00:00Z'

              WHERE event_id = $1
            `,
            [
              event?.eventId,
            ],
          );

          /*
           * 4. Executa uma iteração
           * real do worker.
           */
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
           * 5. Agora o produto deve
           * estar disponível pelo GET
           * individual para o usuário
           * do Tenant A.
           */
          const getResponse =
            await app.inject({
              method:
                'GET',

              url:
                `/products/${created.id}`,

              headers: {
                cookie:
                  identityA.cookie,
              },
            });

          expect(
            getResponse.statusCode,
          ).toBe(200);

          const projected =
            getResponse.json<{
              id:
                string;

              tenantId:
                string;

              sku:
                string;

              name:
                string;

              categoryId:
                string;

              status:
                string;

              projectedAt:
                string;
            }>();

          expect(
            projected,
          ).toEqual(
            expect.objectContaining({
              id:
                created.id,

              tenantId:
                identityA.tenantId,

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
            expect.any(
              String,
            ),
          );

          /*
           * 6. A listagem do Tenant A
           * também deve retornar
           * o produto.
           */
          const listResponse =
            await app.inject({
              method:
                'GET',

              url:
                '/products?limit=20&offset=0',

              headers: {
                cookie:
                  identityA.cookie,
              },
            });

          expect(
            listResponse.statusCode,
          ).toBe(200);

          const list =
            listResponse.json<{
              items:
                Array<{
                  id:
                    string;

                  tenantId:
                    string;

                  sku:
                    string;

                  name:
                    string;

                  status:
                    string;
                }>;

              hasMore:
                boolean;

              nextOffset:
                number | null;
            }>();

          expect(
            list.items,
          ).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id:
                  created.id,

                tenantId:
                  identityA.tenantId,

                sku:
                  expectedSku,

                name:
                  'Produto E2E',

                status:
                  'draft',
              }),
            ]),
          );

          expect(
            list.items,
          ).toHaveLength(1);

          expect(
            list.hasMore,
          ).toBe(false);

          expect(
            list.nextOffset,
          ).toBeNull();

          /*
           * 7. O evento deve estar
           * processado e fora da fila
           * de retry.
           */
          const processedEvent =
            await pool.query<{
              processedAt:
                Date | null;

              processingAttempts:
                number;

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

                  next_attempt_at
                    AS "nextAttemptAt",

                  dead_lettered_at
                    AS "deadLetteredAt"

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

          expect(
            processedEvent
              .rows[0]
              ?.nextAttemptAt,
          ).toBeNull();

          expect(
            processedEvent
              .rows[0]
              ?.deadLetteredAt,
          ).toBeNull();

          /*
           * 8. Isolamento multi-tenant
           * real pela sessão.
           *
           * O usuário do Tenant B
           * possui uma sessão válida,
           * mas não pode ler o produto
           * pertencente ao Tenant A.
           */
          const wrongTenantResponse =
            await app.inject({
              method:
                'GET',

              url:
                `/products/${created.id}`,

              headers: {
                cookie:
                  identityB.cookie,
              },
            });

          expect(
            wrongTenantResponse.statusCode,
          ).toBe(404);

          /*
           * A listagem do Tenant B
           * também não pode conter
           * o produto do Tenant A.
           */
          const wrongTenantList =
            await app.inject({
              method:
                'GET',

              url:
                '/products?limit=20&offset=0',

              headers: {
                cookie:
                  identityB.cookie,
              },
            });

          expect(
            wrongTenantList.statusCode,
          ).toBe(200);

          const tenantBList =
            wrongTenantList.json<{
              items:
                Array<{
                  id:
                    string;
                }>;
            }>();

          expect(
            tenantBList.items,
          ).toHaveLength(0);
        } finally {
          /*
           * Catalog precisa ser limpo
           * antes de Identity.
           *
           * A ordem interna do helper é:
           *
           * projection
           * → outbox
           * → products
           * → categories
           */
          if (
            identityA !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identityA.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identityA,
            );
          }

          if (
            identityB !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identityB.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identityB,
            );
          }
        }
      },
    );
  },
);