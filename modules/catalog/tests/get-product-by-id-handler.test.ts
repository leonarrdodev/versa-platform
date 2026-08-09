import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  GetProductByIdHandler,
  parseProductId,
  parseTenantId,
} from '../src/index.js';

import type {
  ProductReadModel,
  ProductReadRepository,
} from '../src/index.js';

const TENANT_ID =
  '11111111-1111-4111-8111-111111111111';

const PRODUCT_ID =
  '22222222-2222-4222-8222-222222222222';

const PRODUCT: ProductReadModel = {
  id: PRODUCT_ID,
  tenantId: TENANT_ID,
  sku: 'BLUSA-001',
  name: 'Blusa Canelada Feminina',
  categoryId:
    '33333333-3333-4333-8333-333333333333',
  status: 'draft',
  createdAt:
    '2026-08-09T03:00:00.000Z',
  updatedAt:
    '2026-08-09T03:00:00.000Z',
  projectedAt:
    '2026-08-09T03:00:01.000Z',
};

describe('GetProductByIdHandler', () => {
  it(
    'returns the product from the read model',
    async () => {
      const findById = vi.fn(
        async () => PRODUCT,
      );

      const repository:
        ProductReadRepository = {
          findById,
        };

      const handler =
        new GetProductByIdHandler(
          repository,
        );

      const result =
        await handler.execute({
          tenantId: TENANT_ID,
          productId: PRODUCT_ID,
        });

      expect(result).toEqual(
        PRODUCT,
      );

      expect(findById)
        .toHaveBeenCalledWith(
          parseTenantId(
            TENANT_ID,
          ),

          parseProductId(
            PRODUCT_ID,
          ),
        );
    },
  );

  it(
    'returns null when product does not exist',
    async () => {
      const repository:
        ProductReadRepository = {
          async findById() {
            return null;
          },
        };

      const handler =
        new GetProductByIdHandler(
          repository,
        );

      const result =
        await handler.execute({
          tenantId: TENANT_ID,
          productId: PRODUCT_ID,
        });

      expect(result).toBeNull();
    },
  );

  it(
    'rejects an invalid product id',
    async () => {
      const repository:
        ProductReadRepository = {
          async findById() {
            return null;
          },
        };

      const handler =
        new GetProductByIdHandler(
          repository,
        );

      await expect(
        handler.execute({
          tenantId: TENANT_ID,
          productId:
            'not-a-uuid',
        }),
      ).rejects.toThrow();
    },
  );
});