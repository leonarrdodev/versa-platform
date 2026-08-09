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
  PostgresProductReadRepository,
  parseProductId,
  parseTenantId,
} from '../src/index.js';

const TENANT_ID =
  '11111111-1111-4111-8111-111111111111';

const PRODUCT_ID =
  '22222222-2222-4222-8222-222222222222';

describe(
  'PostgresProductReadRepository',
  () => {
    it(
      'reads a product from the projection',
      async () => {
        const query = vi.fn(
          async (
            _sql: string,
            _values:
              readonly unknown[],
          ) => ({
            rows: [
              {
                id:
                  PRODUCT_ID,

                tenantId:
                  TENANT_ID,

                sku:
                  'BLUSA-001',

                name:
                  'Blusa Canelada Feminina',

                categoryId:
                  '33333333-3333-4333-8333-333333333333',

                status:
                  'draft',

                createdAt:
                  new Date(
                    '2026-08-09T03:00:00.000Z',
                  ),

                updatedAt:
                  new Date(
                    '2026-08-09T03:00:00.000Z',
                  ),

                projectedAt:
                  new Date(
                    '2026-08-09T03:00:01.000Z',
                  ),
              },
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
          await repository
            .findById(
              parseTenantId(
                TENANT_ID,
              ),

              parseProductId(
                PRODUCT_ID,
              ),
            );

        expect(result).toEqual({
          id: PRODUCT_ID,
          tenantId:
            TENANT_ID,

          sku: 'BLUSA-001',

          name:
            'Blusa Canelada Feminina',

          categoryId:
            '33333333-3333-4333-8333-333333333333',

          status: 'draft',

          createdAt:
            '2026-08-09T03:00:00.000Z',

          updatedAt:
            '2026-08-09T03:00:00.000Z',

          projectedAt:
            '2026-08-09T03:00:01.000Z',
        });

        expect(query)
          .toHaveBeenCalledOnce();

        const call =
          query.mock.calls[0];

        if (call === undefined) {
          throw new Error(
            'Expected PostgreSQL query',
          );
        }

        const [
          sql,
          values,
        ] = call;

        expect(sql).toContain(
          'FROM product_read_model',
        );

        expect(values).toEqual([
          TENANT_ID,
          PRODUCT_ID,
        ]);
      },
    );

    it(
      'returns null when the projection does not exist',
      async () => {
        const query = vi.fn(
          async (
            _sql: string,
            _values:
              readonly unknown[],
          ) => ({
            rows: [],
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
          await repository
            .findById(
              parseTenantId(
                TENANT_ID,
              ),

              parseProductId(
                PRODUCT_ID,
              ),
            );

        expect(result).toBeNull();
      },
    );

    it(
      'rejects an invalid status stored in the read model',
      async () => {
        const query = vi.fn(
          async (
            _sql: string,
            _values:
              readonly unknown[],
          ) => ({
            rows: [
              {
                id:
                  PRODUCT_ID,

                tenantId:
                  TENANT_ID,

                sku:
                  'BLUSA-001',

                name:
                  'Blusa',

                categoryId:
                  '33333333-3333-4333-8333-333333333333',

                status:
                  'INVALID_STATUS',

                createdAt:
                  new Date(),

                updatedAt:
                  new Date(),

                projectedAt:
                  new Date(),
              },
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

        await expect(
          repository.findById(
            parseTenantId(
              TENANT_ID,
            ),

            parseProductId(
              PRODUCT_ID,
            ),
          ),
        ).rejects.toThrow(
          'Status inválido no read model',
        );
      },
    );
  },
);