import type {
  Pool,
} from 'pg';

import type {
  CatalogTransaction,
  CatalogUnitOfWork,
} from '../../application/ports/catalog-unit-of-work.js';

import {
  PostgresCategoryRepository,
} from './postgres-category-repository.js';

import {
  PostgresOutboxRepository,
} from './postgres-outbox-repository.js';

import {
  PostgresProductRepository,
} from './postgres-product-repository.js';

export class PostgresCatalogUnitOfWork
implements CatalogUnitOfWork {
  constructor(
    private readonly pool: Pool,
  ) {}

  async execute<T>(
    work: (
      transaction: CatalogTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    const client =
      await this.pool.connect();

    let transactionStarted = false;

    try {
      await client.query('BEGIN');

      transactionStarted = true;

      const transaction:
        CatalogTransaction = {
          categories:
            new PostgresCategoryRepository(
              client,
            ),

          products:
            new PostgresProductRepository(
              client,
            ),

          outbox:
            new PostgresOutboxRepository(
              client,
            ),
        };

      const result =
        await work(
          transaction,
        );

      await client.query('COMMIT');

      transactionStarted = false;

      return result;
    } catch (error) {
      if (transactionStarted) {
        await client.query(
          'ROLLBACK',
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }
}