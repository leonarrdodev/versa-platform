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

export type {
  ProductRepository,
} from './application/ports/product-repository.js';

export type {
  OutboxRepository,
} from './application/ports/outbox-repository.js';

export type {
  CatalogTransaction,
  CatalogUnitOfWork,
} from './application/ports/catalog-unit-of-work.js';

export type {
  CreateProductCommand,
} from './application/create-product/create-product-command.js';

export type {
  CreateProductResult,
} from './application/create-product/create-product-result.js';

export {
  CreateProductHandler,
} from './application/create-product/create-product-handler.js';

export type {
  CreateProductHandlerDependencies,
} from './application/create-product/create-product-handler.js';

export {
  PostgresProductRepository,
} from './infrastructure/postgres/postgres-product-repository.js';

export {
  PostgresOutboxRepository,
} from './infrastructure/postgres/postgres-outbox-repository.js';

export {
  PostgresCatalogUnitOfWork,
} from './infrastructure/postgres/postgres-catalog-unit-of-work.js';

export type {
  ProductReadModel,
  ProductReadRepository,
} from './application/ports/product-read-repository.js';

export {
  GetProductByIdHandler,
} from './application/get-product-by-id/get-product-by-id-handler.js';

export type {
  GetProductByIdQuery,
} from './application/get-product-by-id/get-product-by-id-handler.js';

export {
  PostgresProductReadRepository,
} from './infrastructure/postgres/postgres-product-read-repository.js';