import type {
  Pool,
} from 'pg';

import type {
  CategoryReadModel,
  CategoryReadRepository,
} from '../../application/ports/category-read-repository.js';

import {
  isCategoryStatus,
} from '../../domain/category/category-status.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

interface CategoryReadRow {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly name:
    string;

  readonly status:
    string;

  readonly createdAt:
    Date;

  readonly updatedAt:
    Date;
}

export class PostgresCategoryReadRepository
implements CategoryReadRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async findActiveByTenant(
    tenantId:
      TenantId,
  ): Promise<
    readonly CategoryReadModel[]
  > {
    const result =
      await this.pool
        .query<CategoryReadRow>(
          `
            SELECT
              id,

              tenant_id
                AS "tenantId",

              name,

              status,

              created_at
                AS "createdAt",

              updated_at
                AS "updatedAt"

            FROM categories

            WHERE
              tenant_id = $1
              AND status = 'active'

            ORDER BY
              normalized_name ASC,
              id ASC
          `,
          [
            tenantId,
          ],
        );

    return result.rows.map(
      (
        row,
      ): CategoryReadModel => {
        if (
          !isCategoryStatus(
            row.status,
          )
        ) {
          throw new Error(
            `Status inválido em categories: ${row.status}`,
          );
        }

        return {
          id:
            row.id,

          tenantId:
            row.tenantId,

          name:
            row.name,

          status:
            row.status,

          createdAt:
            row.createdAt
              .toISOString(),

          updatedAt:
            row.updatedAt
              .toISOString(),
        };
      },
    );
  }
}