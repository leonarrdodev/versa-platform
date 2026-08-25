import {
  CreateProductHandler,
  GetProductByIdHandler,
  GetProductsHandler,
  PostgresCatalogUnitOfWork,
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
  readonly createProductHandler:
    CreateProductHandler;

  readonly getProductByIdHandler:
    GetProductByIdHandler;

  readonly getProductsHandler:
    GetProductsHandler;

  readonly idGenerator:
    IdGenerator;
}

export function createCatalogComposition(
  pool: DatabasePool,
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

  const getProductByIdHandler =
    new GetProductByIdHandler(
      productReadRepository,
    );

  const getProductsHandler =
    new GetProductsHandler(
      productReadRepository,
    );

  const createProductHandler =
    new CreateProductHandler({
      clock,
      idGenerator,
      unitOfWork,
    });

  return {
    createProductHandler,
    getProductByIdHandler,
    getProductsHandler,
    idGenerator,
  };
}