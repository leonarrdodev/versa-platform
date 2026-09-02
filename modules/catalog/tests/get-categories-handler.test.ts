import type {
  CategoryReadModel,
  CategoryReadRepository,
  TenantId,
} from '../src/index.js';

import {
  GetCategoriesHandler,
  tenantIdFromUuid,
} from '../src/index.js';

import {
  describe,
  expect,
  it,
} from 'vitest';

const TENANT_ID =
  tenantIdFromUuid(
    '11111111-1111-4111-8111-111111111111',
  );

class InMemoryCategoryReadRepository
implements CategoryReadRepository {
  public calls:
    TenantId[] = [];

  public categories:
    readonly CategoryReadModel[] = [];

  async findActiveByTenant(
    tenantId:
      TenantId,
  ): Promise<
    readonly CategoryReadModel[]
  > {
    this.calls.push(
      tenantId,
    );

    return this.categories;
  }
}

describe(
  'GetCategoriesHandler',
  () => {
    it(
      'returns active categories from the authenticated tenant',
      async () => {
        const repository =
          new InMemoryCategoryReadRepository();

        repository.categories = [
          {
            id:
              '22222222-2222-4222-8222-222222222222',

            tenantId:
              TENANT_ID,

            name:
              'Blusas',

            status:
              'active',

            createdAt:
              '2026-08-30T12:00:00.000Z',

            updatedAt:
              '2026-08-30T12:00:00.000Z',
          },

          {
            id:
              '33333333-3333-4333-8333-333333333333',

            tenantId:
              TENANT_ID,

            name:
              'Calças',

            status:
              'active',

            createdAt:
              '2026-08-30T12:00:00.000Z',

            updatedAt:
              '2026-08-30T12:00:00.000Z',
          },
        ];

        const handler =
          new GetCategoriesHandler(
            repository,
          );

        const result =
          await handler.execute({
            tenantId:
              TENANT_ID,
          });

        expect(
          result,
        ).toEqual(
          repository.categories,
        );

        expect(
          repository.calls,
        ).toEqual([
          TENANT_ID,
        ]);
      },
    );

    it(
      'returns an empty list when the tenant has no active categories',
      async () => {
        const repository =
          new InMemoryCategoryReadRepository();

        const handler =
          new GetCategoriesHandler(
            repository,
          );

        const result =
          await handler.execute({
            tenantId:
              TENANT_ID,
          });

        expect(
          result,
        ).toEqual([]);

        expect(
          repository.calls,
        ).toEqual([
          TENANT_ID,
        ]);
      },
    );

    it(
      'rejects an invalid tenant id before consulting the repository',
      async () => {
        const repository =
          new InMemoryCategoryReadRepository();

        const handler =
          new GetCategoriesHandler(
            repository,
          );

        await expect(
          handler.execute({
            tenantId:
              'invalid-tenant',
          }),
        ).rejects.toThrow();

        expect(
          repository.calls,
        ).toHaveLength(0);
      },
    );
  },
);