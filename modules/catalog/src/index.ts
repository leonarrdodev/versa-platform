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

export {
  ProductSkuAlreadyExistsError,
} from './domain/product/product-sku-already-exists-error.js';

export {
  ProductCategoryNotAvailableError,
} from './domain/product/product-category-not-available-error.js';

export {
  GetProductsHandler,
} from './application/get-products/get-products-handler.js';

export type {
  GetProductsQuery,
} from './application/get-products/get-products-handler.js';

export type {
  FindProductsOptions,
  ProductReadPage,
} from './application/ports/product-read-repository.js';

export {
  CategoryName,
} from './domain/category/category-name.js';

export {
  CATEGORY_STATUSES,
  INITIAL_CATEGORY_STATUS,
  isCategoryStatus,
} from './domain/category/category-status.js';

export type {
  CategoryStatus,
} from './domain/category/category-status.js';

export {
  Category,
  CATEGORY_AGGREGATE_TYPE,
} from './domain/category/category.js';

export type {
  CreateCategoryInput,
  CategoryCreationDependencies,
} from './domain/category/category.js';

export type {
  CategoryRepository,
} from './application/ports/category-repository.js';

export {
  PostgresCategoryRepository,
} from './infrastructure/postgres/postgres-category-repository.js';

export {
  CategoryNameAlreadyExistsError,
} from './domain/category/category-name-already-exists-error.js';

export type {
  CreateCategoryCommand,
} from './application/create-category/create-category-command.js';

export type {
  CreateCategoryResult,
} from './application/create-category/create-category-result.js';

export {
  CreateCategoryHandler,
} from './application/create-category/create-category-handler.js';

export type {
  CreateCategoryHandlerDependencies,
} from './application/create-category/create-category-handler.js';

export type {
  CategoryReadModel,
  CategoryReadRepository,
} from './application/ports/category-read-repository.js';

export {
  GetCategoriesHandler,
} from './application/get-categories/get-categories-handler.js';

export type {
  GetCategoriesQuery,
} from './application/get-categories/get-categories-handler.js';

export {
  PostgresCategoryReadRepository,
} from './infrastructure/postgres/postgres-category-read-repository.js';

export {
  ProductBrand,
  PRODUCT_BRAND_MAX_LENGTH,
} from './domain/product/product-brand.js';

export {
  ProductDescription,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
} from './domain/product/product-description.js';