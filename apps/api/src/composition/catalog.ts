import {
  CreateCategoryHandler,
  CreateProductHandler,
  GetCategoriesHandler,
  GetProductByIdHandler,
  GetProductsHandler,
  PostgresCatalogUnitOfWork,
  PostgresCategoryReadRepository,
  PostgresProductReadRepository,
} from '@versa/catalog';

import {
  createDatabasePool,
} from '@versa/database';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import type {
  IdGenerator,
} from '@versa/shared-kernel';

type DatabasePool =
  ReturnType<
    typeof createDatabasePool
  >;

export interface CatalogComposition {
  readonly createCategoryHandler:
    CreateCategoryHandler;

  readonly createProductHandler:
    CreateProductHandler;

  readonly getCategoriesHandler:
    GetCategoriesHandler;

  readonly getProductByIdHandler:
    GetProductByIdHandler;

  readonly getProductsHandler:
    GetProductsHandler;

  readonly idGenerator:
    IdGenerator;
}

export function createCatalogComposition(
  pool:
    DatabasePool,
): CatalogComposition {
  const clock =
    new SystemClock();

  const idGenerator =
    new RandomUuidGenerator();

  const unitOfWork =
    new PostgresCatalogUnitOfWork(
      pool,
    );

  const productReadRepository =
    new PostgresProductReadRepository(
      pool,
    );

  const categoryReadRepository =
    new PostgresCategoryReadRepository(
      pool,
    );

  const createCategoryHandler =
    new CreateCategoryHandler({
      clock,
      idGenerator,
      unitOfWork,
    });

  const createProductHandler =
    new CreateProductHandler({
      clock,
      idGenerator,
      unitOfWork,
    });

  const getCategoriesHandler =
    new GetCategoriesHandler(
      categoryReadRepository,
    );

  const getProductByIdHandler =
    new GetProductByIdHandler(
      productReadRepository,
    );

  const getProductsHandler =
    new GetProductsHandler(
      productReadRepository,
    );

  return {
    createCategoryHandler,
    createProductHandler,
    getCategoriesHandler,
    getProductByIdHandler,
    getProductsHandler,
    idGenerator,
  };
}