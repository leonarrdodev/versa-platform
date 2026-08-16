import type {
  Pool,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseTenantId,
} from '../src/domain/identifiers/tenant-id.js';

import {
  PostgresProductReadRepository,
} from '../src/infrastructure/postgres/postgres-product-read-repository.js';

const TENANT_ID =
  '11111111-1111-4111-8111-111111111111';

function createRow(
  index: number,
) {
  return {
    id:
      `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,

    tenantId:
      TENANT_ID,

    sku:
      `SKU-${index}`,

    name:
      `Produto ${index}`,

    categoryId:
      '22222222-2222-4222-8222-222222222222',

    status:
      'draft',

    createdAt:
      new Date(
        '2026-08-15T00:00:00.000Z',
      ),

    updatedAt:
      new Date(
        '2026-08-15T00:00:00.000Z',
      ),

    projectedAt:
      new Date(
        '2026-08-15T00:00:00.000Z',
      ),
  };
}

describe(
  'PostgresProductReadRepository.findMany',
  () => {
    it(
      'requests limit plus one and returns hasMore',
      async () => {
        const rows =
          Array.from(
            {
              length: 21,
            },

            (_, index) =>
              createRow(
                index + 1,
              ),
          );

        const query =
          vi.fn(
            async () => ({
              rows,
            }),
          );

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresProductReadRepository(
            pool,
          );

        const result =
          await repository.findMany(
            parseTenantId(
              TENANT_ID,
            ),
            {
              limit:
                20,

              offset:
                0,
            },
          );

        expect(
          result.items,
        ).toHaveLength(20);

        expect(
          result.hasMore,
        ).toBe(true);

        expect(
          result.nextOffset,
        ).toBe(20);

        expect(
          query,
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            'WHERE tenant_id = $1',
          ),
          [
            TENANT_ID,
            21,
            0,
          ],
        );
      },
    );

    it(
      'returns no next offset when there is no next page',
      async () => {
        const query =
          vi.fn(
            async () => ({
              rows: [
                createRow(1),
                createRow(2),
              ],
            }),
          );

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresProductReadRepository(
            pool,
          );

        const result =
          await repository.findMany(
            parseTenantId(
              TENANT_ID,
            ),
            {
              limit:
                20,

              offset:
                40,
            },
          );

        expect(
          result.items,
        ).toHaveLength(2);

        expect(
          result.hasMore,
        ).toBe(false);

        expect(
          result.nextOffset,
        ).toBeNull();
      },
    );
  },
);