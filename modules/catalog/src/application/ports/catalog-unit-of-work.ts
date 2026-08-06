import type {
  OutboxRepository,
} from './outbox-repository.js';

import type {
  ProductRepository,
} from './product-repository.js';

export interface CatalogTransaction {
  readonly products: ProductRepository;
  readonly outbox: OutboxRepository;
}

export interface CatalogUnitOfWork {
  execute<T>(
    work: (
      transaction: CatalogTransaction,
    ) => Promise<T>,
  ): Promise<T>;
}