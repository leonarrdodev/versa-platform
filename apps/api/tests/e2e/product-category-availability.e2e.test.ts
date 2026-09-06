import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import type {
  Logger,
} from '@versa/observability';

import {
  PerformanceMonotonicClock,
} from '@versa/observability';

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
  createCatalogComposition,
} from '../../src/composition/catalog.js';

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

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

let app:
  FastifyInstance;

const monotonicClock =
  new PerformanceMonotonicClock();

beforeAll(
  async () => {
    pool =
      createDatabasePool(
        env.database,
      );

    const catalog =
      createCatalogComposition(
        pool,
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
          createCategoryHandler:
            catalog.createCategoryHandler,

          createProductHandler:
            catalog.createProductHandler,

          getCategoriesHandler:
            catalog.getCategoriesHandler,

          getProductByIdHandler:
            catalog.getProductByIdHandler,

          getProductsHandler:
            catalog.getProductsHandler,

          idGenerator:
            catalog.idGenerator,

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

async function expectNoProductWrites(
  tenantId:
    string,
): Promise<void> {
  const products =
    await pool.query<{
      count:
        string;
    }>(
      `
        SELECT
          count(*)::text
            AS count

        FROM products

        WHERE tenant_id = $1
      `,
      [
        tenantId,
      ],
    );

  const productEvents =
    await pool.query<{
      count:
        string;
    }>(
      `
        SELECT
          count(*)::text
            AS count

        FROM event_outbox

        WHERE
          tenant_id = $1
          AND event_name =
            'ProductCreated'
      `,
      [
        tenantId,
      ],
    );

  expect(
    Number(
      products
        .rows[0]
        ?.count,
    ),
  ).toBe(0);

  expect(
    Number(
      productEvents
        .rows[0]
        ?.count,
    ),
  ).toBe(0);
}

describe(
  'Product category availability',
  () => {
    it(
      'creates a product when the category is active in the authenticated tenant',
      async () => {
        let identity:
          AuthenticatedIdentity | null =
            null;

        try {
          identity =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-category-active',
            });

          const categoryId =
            await createTestCategory({
              pool,

              tenantId:
                identity.tenantId,

              name:
                'Blusas',
            });

          const response =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identity.cookie,
              },

              payload: {
                sku:
                  `ACTIVE-${randomUUID()}`,

                name:
                  'Produto categoria ativa',

                categoryId,
              },
            });

          expect(
            response.statusCode,
          ).toBe(201);

          const created =
            response.json<{
              id:
                string;

              tenantId:
                string;

              categoryId:
                string;
            }>();

          expect(
            created.tenantId,
          ).toBe(
            identity.tenantId,
          );

          expect(
            created.categoryId,
          ).toBe(
            categoryId,
          );

          const persistedProduct =
            await pool.query<{
              tenantId:
                string;

              categoryId:
                string;
            }>(
              `
                SELECT
                  tenant_id
                    AS "tenantId",

                  category_id
                    AS "categoryId"

                FROM products

                WHERE id = $1
              `,
              [
                created.id,
              ],
            );

          expect(
            persistedProduct.rows,
          ).toEqual([
            {
              tenantId:
                identity.tenantId,

              categoryId,
            },
          ]);

          const event =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND aggregate_id = $2
                  AND event_name =
                    'ProductCreated'
              `,
              [
                identity.tenantId,
                created.id,
              ],
            );

          expect(
            Number(
              event.rows[0]
                ?.count,
            ),
          ).toBe(1);
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identity.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identity,
            );
          }
        }
      },
    );

    it(
      'returns 409 and writes nothing when the category does not exist',
      async () => {
        let identity:
          AuthenticatedIdentity | null =
            null;

        try {
          identity =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-category-missing',
            });

          const response =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identity.cookie,
              },

              payload: {
                sku:
                  `MISSING-${randomUUID()}`,

                name:
                  'Produto categoria inexistente',

                categoryId:
                  randomUUID(),
              },
            });

          expect(
            response.statusCode,
          ).toBe(409);

          expect(
            response.json(),
          ).toEqual({
            code:
              'PRODUCT_CATEGORY_NOT_AVAILABLE',

            message:
              'A categoria selecionada não está disponível.',
          });

          await expectNoProductWrites(
            identity.tenantId,
          );
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identity.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identity,
            );
          }
        }
      },
    );

    it(
      'returns 409 and does not reveal a category that belongs to another tenant',
      async () => {
        let identityA:
          AuthenticatedIdentity | null =
            null;

        let identityB:
          AuthenticatedIdentity | null =
            null;

        try {
          identityA =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-category-tenant-a',
            });

          identityB =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-category-tenant-b',
            });

          const categoryBId =
            await createTestCategory({
              pool,

              tenantId:
                identityB.tenantId,

              name:
                'Categoria exclusiva B',
            });

          /*
           * Tenant A tenta utilizar
           * uma Category válida,
           * porém pertencente ao B.
           */
          const response =
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
                sku:
                  `OTHER-${randomUUID()}`,

                name:
                  'Produto categoria externa',

                categoryId:
                  categoryBId,
              },
            });

          expect(
            response.statusCode,
          ).toBe(409);

          expect(
            response.json(),
          ).toEqual({
            code:
              'PRODUCT_CATEGORY_NOT_AVAILABLE',

            message:
              'A categoria selecionada não está disponível.',
          });

          /*
           * A resposta não diferencia
           * "outro tenant" de
           * "não existe".
           */
          expect(
            response.body,
          ).not.toContain(
            identityB.tenantId,
          );

          expect(
            response.body
              .toLowerCase(),
          ).not.toContain(
            'tenant',
          );

          await expectNoProductWrites(
            identityA.tenantId,
          );
        } finally {
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

    it(
      'returns 409 and writes nothing when the category is archived',
      async () => {
        let identity:
          AuthenticatedIdentity | null =
            null;

        try {
          identity =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'product-category-archived',
            });

          const categoryId =
            await createTestCategory({
              pool,

              tenantId:
                identity.tenantId,

              name:
                'Categoria arquivada',
            });

          /*
           * Ainda não temos o command
           * ArchiveCategory.
           *
           * Para este E2E alteramos
           * diretamente o estado
           * persistido.
           */
          await pool.query(
            `
              UPDATE categories

              SET
                status = 'archived',
                updated_at = NOW()

              WHERE
                id = $1
                AND tenant_id = $2
            `,
            [
              categoryId,
              identity.tenantId,
            ],
          );

          const response =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identity.cookie,
              },

              payload: {
                sku:
                  `ARCHIVED-${randomUUID()}`,

                name:
                  'Produto categoria arquivada',

                categoryId,
              },
            });

          expect(
            response.statusCode,
          ).toBe(409);

          expect(
            response.json(),
          ).toEqual({
            code:
              'PRODUCT_CATEGORY_NOT_AVAILABLE',

            message:
              'A categoria selecionada não está disponível.',
          });

          /*
           * Também não revelamos ao
           * cliente que o motivo
           * específico é "archived".
           */
          expect(
            response.body
              .toLowerCase(),
          ).not.toContain(
            'archived',
          );

          await expectNoProductWrites(
            identity.tenantId,
          );
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identity.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identity,
            );
          }
        }
      },
    );
  },
);