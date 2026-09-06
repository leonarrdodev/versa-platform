import type {
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  parseCategoryId,
  parseTenantId,
  PostgresCategoryRepository,
} from '../src/index.js';

const TENANT_ID =
  '33333333-3333-4333-8333-333333333333';

const CATEGORY_ID =
  '44444444-4444-4444-8444-444444444444';

describe(
  'PostgresCategoryRepository',
  () => {
    it(
      'finds and locks an active category from the requested tenant',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rowCount:
                1,

              rows: [
                {
                  id:
                    CATEGORY_ID,
                },
              ],
            });

        const client = {
          query,
        } as unknown as
          PoolClient;

        const repository =
          new PostgresCategoryRepository(
            client,
          );

        const result =
          await repository
            .isActiveById(
              parseTenantId(
                TENANT_ID,
              ),

              parseCategoryId(
                CATEGORY_ID,
              ),
            );

        expect(
          result,
        ).toBe(true);

        expect(
          query,
        ).toHaveBeenCalledOnce();

        const [
          sql,
          values,
        ] =
          query.mock.calls[0] ??
          [];

        expect(
          sql,
        ).toContain(
          "status = 'active'",
        );

        expect(
          sql,
        ).toContain(
          'tenant_id = $1',
        );

        expect(
          sql,
        ).toContain(
          'id = $2',
        );

        expect(
          sql,
        ).toContain(
          'FOR SHARE',
        );

        expect(
          values,
        ).toEqual([
          TENANT_ID,
          CATEGORY_ID,
        ]);
      },
    );

    it(
      'returns false when no active category is available in the requested tenant',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rowCount:
                0,

              rows:
                [],
            });

        const client = {
          query,
        } as unknown as
          PoolClient;

        const repository =
          new PostgresCategoryRepository(
            client,
          );

        const result =
          await repository
            .isActiveById(
              parseTenantId(
                TENANT_ID,
              ),

              parseCategoryId(
                CATEGORY_ID,
              ),
            );

        expect(
          result,
        ).toBe(false);
      },
    );
  },
);