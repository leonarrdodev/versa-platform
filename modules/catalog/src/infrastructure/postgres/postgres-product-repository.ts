import type {
  PoolClient,
} from 'pg';

import type {
  ProductRepository,
} from '../../application/ports/product-repository.js';

import type {
  Product,
} from '../../domain/product/product.js';

import {
  ProductSkuAlreadyExistsError,
} from '../../domain/product/product-sku-already-exists-error.js';

const PRODUCT_TENANT_SKU_UNIQUE_CONSTRAINT =
  'products_tenant_sku_unique';

function isTenantSkuUniqueViolation(
  error:
    unknown,
): boolean {
  if (
    typeof error !==
      'object'
    ||
    error ===
      null
  ) {
    return false;
  }

  const candidate =
    error as {
      code?:
        unknown;

      constraint?:
        unknown;
    };

  return (
    candidate.code ===
      '23505'
    &&
    candidate.constraint ===
      PRODUCT_TENANT_SKU_UNIQUE_CONSTRAINT
  );
}

export class PostgresProductRepository
implements ProductRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    product:
      Product,
  ): Promise<void> {
    try {
      await this.client.query(
        `
          INSERT INTO products (
            id,
            tenant_id,
            sku,
            name,
            brand,
            description,
            category_id,
            status,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10
          )
        `,
        [
          product.id,
          product.tenantId,
          product.sku.value,
          product.name.value,

          product.brand
            ?.value ??
            null,

          product.description
            ?.value ??
            null,

          product.categoryId,
          product.status,
          product.createdAt,
          product.updatedAt,
        ],
      );
    } catch (error) {
      if (
        isTenantSkuUniqueViolation(
          error,
        )
      ) {
        throw new ProductSkuAlreadyExistsError();
      }

      throw error;
    }
  }
}