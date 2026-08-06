import type {
  ProductStatus,
} from '../../domain/product/product-status.js';

export interface CreateProductResult {
  readonly id: string;
  readonly tenantId: string;
  readonly sku: string;
  readonly name: string;
  readonly categoryId: string;
  readonly status: ProductStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}