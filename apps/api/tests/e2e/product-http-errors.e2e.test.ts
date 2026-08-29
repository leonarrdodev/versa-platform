import {
  randomUUID,
} from 'node:crypto';

import {
  CreateProductHandler,
  GetProductByIdHandler,
  GetProductsHandler,
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
          createProductHandler,

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

async function cleanupTenantProducts(
  tenantId:
    string,
): Promise<void> {
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

describe(
  'Product HTTP error contracts',
  () => {
    it(
      'returns 401 when product creation is unauthenticated',
      async () => {
        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/products',

            payload: {
              sku:
                'TEST-001',

              name:
                'Produto teste',

              categoryId:
                randomUUID(),
            },
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_SESSION',

          message:
            'Sessão inválida ou expirada.',
        });
      },
    );

    it(
      'returns 400 for invalid SKU',
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
                'invalid-sku',
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
                  'sku com espaço inválido',

                name:
                  'Produto teste',

                categoryId:
                  randomUUID(),
              },
            });

          expect(
            response.statusCode,
          ).toBe(400);

          expect(
            response.json(),
          ).toEqual({
            code:
              'INVALID_INPUT',

            message:
              'Os dados enviados são inválidos.',
          });
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantProducts(
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
      'returns 404 when product does not exist in the authenticated tenant',
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
                'not-found',
            });

          const response =
            await app.inject({
              method:
                'GET',

              url:
                `/products/${randomUUID()}`,

              headers: {
                cookie:
                  identity.cookie,
              },
            });

          expect(
            response.statusCode,
          ).toBe(404);

          expect(
            response.json(),
          ).toEqual({
            code:
              'PRODUCT_NOT_FOUND',

            message:
              'Produto não encontrado.',
          });
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantProducts(
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
      'returns 409 for duplicate SKU in the same authenticated tenant but allows it in another tenant',
      async () => {
        let identityA:
          AuthenticatedIdentity | null =
            null;

        let identityB:
          AuthenticatedIdentity | null =
            null;

        const categoryId =
          randomUUID();

        const sku =
          `SKU-${randomUUID()}`
            .toUpperCase();

        try {
          identityA =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'duplicate-a',
            });

          identityB =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'duplicate-b',
            });

          /*
           * Primeiro cadastro no
           * Tenant A.
           */
          const first =
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
                  'Produto A',

                categoryId,
              },
            });

          expect(
            first.statusCode,
          ).toBe(201);

          /*
           * Mesmo SKU na mesma sessão
           * / mesmo tenant deve resultar
           * em conflito.
           */
          const duplicate =
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
                  'Produto duplicado',

                categoryId,
              },
            });

          expect(
            duplicate.statusCode,
          ).toBe(409);

          expect(
            duplicate.json(),
          ).toEqual({
            code:
              'PRODUCT_SKU_ALREADY_EXISTS',

            message:
              'Já existe um produto com este SKU.',
          });

          /*
           * O mesmo SKU usando uma
           * sessão pertencente a outro
           * tenant continua permitido.
           */
          const otherTenant =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identityB.cookie,
              },

              payload: {
                sku,

                name:
                  'Produto B',

                categoryId,
              },
            });

          expect(
            otherTenant.statusCode,
          ).toBe(201);

          const tenantAProduct =
            first.json<{
              tenantId:
                string;
            }>();

          const tenantBProduct =
            otherTenant.json<{
              tenantId:
                string;
            }>();

          expect(
            tenantAProduct.tenantId,
          ).toBe(
            identityA.tenantId,
          );

          expect(
            tenantBProduct.tenantId,
          ).toBe(
            identityB.tenantId,
          );

          expect(
            tenantAProduct.tenantId,
          ).not.toBe(
            tenantBProduct.tenantId,
          );
        } finally {
          if (
            identityA !==
            null
          ) {
            await cleanupTenantProducts(
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
            await cleanupTenantProducts(
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
      'returns 400 for invalid product list pagination',
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
                'pagination',
            });

          const response =
            await app.inject({
              method:
                'GET',

              url:
                '/products?limit=101&offset=0',

              headers: {
                cookie:
                  identity.cookie,
              },
            });

          expect(
            response.statusCode,
          ).toBe(400);

          expect(
            response.json(),
          ).toEqual({
            code:
              'INVALID_INPUT',

            message:
              'Os dados enviados são inválidos.',
          });
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantProducts(
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
      'returns 401 when product listing has no authenticated session',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/products?limit=20&offset=0',
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_SESSION',

          message:
            'Sessão inválida ou expirada.',
        });
      },
    );
  },
);