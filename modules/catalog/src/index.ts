export type {
  ProductId,
} from './domain/identifiers/product-id.js';

export {
  parseProductId,
  productIdFromUuid,
} from './domain/identifiers/product-id.js';

export type {
  TenantId,
} from './domain/identifiers/tenant-id.js';

export {
  parseTenantId,
  tenantIdFromUuid,
} from './domain/identifiers/tenant-id.js';

export type {
  CategoryId,
} from './domain/identifiers/category-id.js';

export {
  categoryIdFromUuid,
  parseCategoryId,
} from './domain/identifiers/category-id.js';

export {
  ProductSku,
} from './domain/product/product-sku.js';

export {
  ProductName,
} from './domain/product/product-name.js';

export {
  INITIAL_PRODUCT_STATUS,
  isProductStatus,
  PRODUCT_STATUSES,
} from './domain/product/product-status.js';

export type {
  ProductStatus,
} from './domain/product/product-status.js';

export {
  Product,
  PRODUCT_AGGREGATE_TYPE,
} from './domain/product/product.js';

export type {
  CreateProductInput,
  ProductCreationDependencies,
} from './domain/product/product.js';