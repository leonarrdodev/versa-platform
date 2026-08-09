import type {
  Pool,
} from 'pg';

import type {
  ProductId,
} from '../../domain/identifiers/product-id.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

import {
  isProductStatus,
} from '../../domain/product/product-status.js';

import type {
  ProductReadModel,
  ProductReadRepository,
} from '../../application/ports/product-read-repository.js';

interface ProductReadRow {
  readonly id: string;
  readonly tenantId: string;

  readonly sku: string;
  readonly name: string;
  readonly categoryId: string;

  readonly status: string;

  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly projectedAt: Date;
}

export class PostgresProductReadRepository
implements ProductReadRepository {
  constructor(
    private readonly pool: Pool,
  ) {}

  async findById(
    tenantId: TenantId,
    productId: ProductId,
  ): Promise<ProductReadModel | null> {
    const result =
      await this.pool.query<ProductReadRow>(
        `
          SELECT
            id,

            tenant_id
              AS "tenantId",

            sku,
            name,

            category_id
              AS "categoryId",

            status,

            created_at
              AS "createdAt",

            updated_at
              AS "updatedAt",

            projected_at
              AS "projectedAt"

          FROM product_read_model

          WHERE
            tenant_id = $1
            AND id = $2

          LIMIT 1
        `,
        [
          tenantId,
          productId,
        ],
      );

    const row =
      result.rows[0];

    if (row === undefined) {
      return null;
    }

    if (!isProductStatus(row.status)) {
      throw new Error(
        `Status inválido no read model: ${row.status}`,
      );
    }

    return {
      id: row.id,
      tenantId:
        row.tenantId,

      sku: row.sku,
      name: row.name,

      categoryId:
        row.categoryId,

      status: row.status,

      createdAt:
        row.createdAt
          .toISOString(),

      updatedAt:
        row.updatedAt
          .toISOString(),

      projectedAt:
        row.projectedAt
          .toISOString(),
    };
  }
}