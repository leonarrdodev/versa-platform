import type {
  Pool,
} from 'pg';

import type {
  FindProductsOptions,
  ProductReadModel,
  ProductReadPage,
  ProductReadRepository,
} from '../../application/ports/product-read-repository.js';

import type {
  ProductId,
} from '../../domain/identifiers/product-id.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

import {
  isProductStatus,
} from '../../domain/product/product-status.js';

interface ProductReadRow {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly sku:
    string;

  readonly name:
    string;

  readonly categoryId:
    string;

  readonly brand?:
    string | null;

  readonly description?:
    string | null;

  readonly status:
    string;

  readonly createdAt:
    Date;

  readonly updatedAt:
    Date;

  readonly projectedAt:
    Date;
}

function mapProductReadRow(
  row:
    ProductReadRow,
): ProductReadModel {
  if (
    !isProductStatus(
      row.status,
    )
  ) {
    throw new Error(
      `Status inválido no read model: ${row.status}`,
    );
  }

  return {
    id:
      row.id,

    tenantId:
      row.tenantId,

    sku:
      row.sku,

    name:
      row.name,

    categoryId:
      row.categoryId,

    ...(typeof row.brand ===
    'string'
      ? {
          brand:
            row.brand,
        }
      : {}),

    ...(typeof row.description ===
    'string'
      ? {
          description:
            row.description,
        }
      : {}),

    status:
      row.status,

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

export class PostgresProductReadRepository
implements ProductReadRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async findById(
    tenantId:
      TenantId,

    productId:
      ProductId,
  ): Promise<
    ProductReadModel | null
  > {
    const result =
      await this.pool
        .query<ProductReadRow>(
          `
            SELECT
              id,

              tenant_id
                AS "tenantId",

              sku,
              name,
              brand,
              description,

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

    if (
      row ===
      undefined
    ) {
      return null;
    }

    return mapProductReadRow(
      row,
    );
  }

  async findMany(
    tenantId:
      TenantId,

    options:
      FindProductsOptions,
  ): Promise<
    ProductReadPage
  > {
    const databaseLimit =
      options.limit +
      1;

    const result =
      await this.pool
        .query<ProductReadRow>(
          `
            SELECT
              id,

              tenant_id
                AS "tenantId",

              sku,
              name,
              brand,
              description,

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

            WHERE tenant_id = $1

            ORDER BY
              created_at DESC,
              id DESC

            LIMIT $2
            OFFSET $3
          `,
          [
            tenantId,
            databaseLimit,
            options.offset,
          ],
        );

    const hasMore =
      result.rows.length >
      options.limit;

    const visibleRows =
      hasMore
        ? result.rows.slice(
            0,
            options.limit,
          )
        : result.rows;

    const items =
      visibleRows.map(
        mapProductReadRow,
      );

    return {
      items,

      hasMore,

      nextOffset:
        hasMore
          ? options.offset +
            items.length
          : null,
    };
  }
}