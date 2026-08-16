import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  GetProductsHandler,
} from '../src/application/get-products/get-products-handler.js';

import type {
  ProductReadRepository,
} from '../src/application/ports/product-read-repository.js';

const TENANT_ID =
  '11111111-1111-4111-8111-111111111111';

function createRepository():
ProductReadRepository {
  return {
    async findById() {
      return null;
    },

    async findMany(
      _tenantId,
      options,
    ) {
      return {
        items: [],
        hasMore: false,
        nextOffset: null,
      };
    },
  };
}

describe(
  'GetProductsHandler',
  () => {
    it(
      'uses default pagination',
      async () => {
        let receivedLimit:
          number | undefined;

        let receivedOffset:
          number | undefined;

        const repository =
          createRepository();

        repository.findMany =
          async (
            _tenantId,
            options,
          ) => {
            receivedLimit =
              options.limit;

            receivedOffset =
              options.offset;

            return {
              items: [],
              hasMore: false,
              nextOffset: null,
            };
          };

        const handler =
          new GetProductsHandler(
            repository,
          );

        await handler.execute({
          tenantId:
            TENANT_ID,
        });

        expect(
          receivedLimit,
        ).toBe(20);

        expect(
          receivedOffset,
        ).toBe(0);
      },
    );

    it(
      'accepts custom pagination',
      async () => {
        let receivedLimit:
          number | undefined;

        let receivedOffset:
          number | undefined;

        const repository =
          createRepository();

        repository.findMany =
          async (
            _tenantId,
            options,
          ) => {
            receivedLimit =
              options.limit;

            receivedOffset =
              options.offset;

            return {
              items: [],
              hasMore: false,
              nextOffset: null,
            };
          };

        const handler =
          new GetProductsHandler(
            repository,
          );

        await handler.execute({
          tenantId:
            TENANT_ID,

          limit:
            10,

          offset:
            20,
        });

        expect(
          receivedLimit,
        ).toBe(10);

        expect(
          receivedOffset,
        ).toBe(20);
      },
    );

    it(
      'rejects invalid limit',
      async () => {
        const handler =
          new GetProductsHandler(
            createRepository(),
          );

        await expect(
          handler.execute({
            tenantId:
              TENANT_ID,

            limit:
              101,
          }),
        ).rejects.toThrow(
          'Product list limit must be between 1 and 100',
        );
      },
    );

    it(
      'rejects negative offset',
      async () => {
        const handler =
          new GetProductsHandler(
            createRepository(),
          );

        await expect(
          handler.execute({
            tenantId:
              TENANT_ID,

            offset:
              -1,
          }),
        ).rejects.toThrow(
          'Product list offset must be zero or greater',
        );
      },
    );

    it(
      'rejects invalid tenant UUID',
      async () => {
        const handler =
          new GetProductsHandler(
            createRepository(),
          );

        await expect(
          handler.execute({
            tenantId:
              'invalid-tenant',
          }),
        ).rejects.toThrow();
      },
    );
  },
);