import type {
  ProductId,
} from '../../domain/identifiers/product-id.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  ProductStatus,
} from '../../domain/product/product-status.js';

export interface ProductReadModel {
  readonly id: string;
  readonly tenantId: string;

  readonly sku: string;
  readonly name: string;
  readonly categoryId: string;

  readonly status:
    ProductStatus;

  readonly createdAt: string;
  readonly updatedAt: string;
  readonly projectedAt: string;
}

export interface ProductReadRepository {
  findById(
    tenantId: TenantId,
    productId: ProductId,
  ): Promise<ProductReadModel | null>;
}