import type {
  PoolClient,
} from 'pg';

import type {
  ProductRepository,
} from '../../application/ports/product-repository.js';

import type {
  Product,
} from '../../domain/product/product.js';

export class PostgresProductRepository
implements ProductRepository {
  constructor(
    private readonly client: PoolClient,
  ) {}

  async insert(
    product: Product,
  ): Promise<void> {
    await this.client.query(
      `
        INSERT INTO products (
          id,
          tenant_id,
          sku,
          name,
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
          $8
        )
      `,
      [
        product.id,
        product.tenantId,
        product.sku.value,
        product.name.value,
        product.categoryId,
        product.status,
        product.createdAt,
        product.updatedAt,
      ],
    );
  }
}