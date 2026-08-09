import {
  CreateProductHandler,
  PostgresCatalogUnitOfWork,
  GetProductByIdHandler,
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

import {
  env,
} from '../config/env.js';

export interface CatalogComposition {
  readonly createProductHandler:
    CreateProductHandler;

  readonly idGenerator:
    IdGenerator;

    readonly getProductByIdHandler:
  GetProductByIdHandler;

  close(): Promise<void>;
}

export function createCatalogComposition():
CatalogComposition {
  const pool = createDatabasePool(
    env.database,
  );

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

  const createProductHandler =
    new CreateProductHandler({
      clock,
      idGenerator,
      unitOfWork,
    });

  return {
  createProductHandler,
  getProductByIdHandler,
  idGenerator,

  async close(): Promise<void> {
    await pool.end();
  },
};
}