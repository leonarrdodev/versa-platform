import {
  CreateProductHandler,
  PostgresCatalogUnitOfWork,
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

  const createProductHandler =
    new CreateProductHandler({
      clock,
      idGenerator,
      unitOfWork,
    });

  return {
    createProductHandler,
    idGenerator,

    async close(): Promise<void> {
      await pool.end();
    },
  };
}