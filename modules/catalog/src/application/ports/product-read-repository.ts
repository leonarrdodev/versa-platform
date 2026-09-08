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
    string;

  readonly description?:
    string;

  readonly status:
    ProductStatus;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly projectedAt:
    string;
}

export interface FindProductsOptions {
  readonly limit:
    number;

  readonly offset:
    number;
}

export interface ProductReadPage {
  readonly items:
    readonly ProductReadModel[];

  readonly hasMore:
    boolean;

  readonly nextOffset:
    number | null;
}

export interface ProductReadRepository {
  findById(
    tenantId:
      TenantId,

    productId:
      ProductId,
  ): Promise<
    ProductReadModel | null
  >;

  findMany(
    tenantId:
      TenantId,

    options:
      FindProductsOptions,
  ): Promise<
    ProductReadPage
  >;
}