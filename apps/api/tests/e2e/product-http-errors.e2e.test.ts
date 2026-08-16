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
  env,
} from '../../src/config/env.js';

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

    app = buildApp({
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

async function cleanupTenant(
  tenantId: string,
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
      'returns 400 for invalid tenant UUID',
      async () => {
        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/products',

            headers: {
              'x-tenant-id':
                'invalid-tenant',
            },

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
        ).toBe(400);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_INPUT',

          message:
            'Os dados enviados são inválidos.',
        });
      },
    );

    it(
      'returns 400 for invalid SKU',
      async () => {
        const tenantId =
          randomUUID();

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/products',

            headers: {
              'x-tenant-id':
                tenantId,
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
      },
    );

    it(
      'returns 404 when product does not exist',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              `/products/${randomUUID()}`,

            headers: {
              'x-tenant-id':
                randomUUID(),
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
      },
    );

    it(
      'returns 409 for duplicate SKU in the same tenant but allows it in another tenant',
      async () => {
        const tenantA =
          randomUUID();

        const tenantB =
          randomUUID();

        const categoryId =
          randomUUID();

        const sku =
          `SKU-${randomUUID()}`
            .toUpperCase();

        try {
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
                'x-tenant-id':
                  tenantA,
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
           * Mesmo SKU no mesmo tenant
           * deve resultar em conflito.
           */
          const duplicate =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                'x-tenant-id':
                  tenantA,
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
           * O mesmo SKU em outro tenant
           * deve continuar permitido.
           */
          const otherTenant =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                'x-tenant-id':
                  tenantB,
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
        } finally {
          await cleanupTenant(
            tenantA,
          );

          await cleanupTenant(
            tenantB,
          );
        }
      },
    );

    it(
      'returns 400 for invalid product list pagination',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/products?limit=101&offset=0',

            headers: {
              'x-tenant-id':
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
      },
    );
  },
);