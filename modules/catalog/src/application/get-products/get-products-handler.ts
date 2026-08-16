import {
  InvalidValueError,
} from '@versa/shared-kernel';

import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  ProductReadPage,
  ProductReadRepository,
} from '../ports/product-read-repository.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface GetProductsQuery {
  readonly tenantId: string;

  readonly limit?:
    number;

  readonly offset?:
    number;
}

export class GetProductsHandler {
  constructor(
    private readonly repository:
      ProductReadRepository,
  ) {}

  async execute(
    query: GetProductsQuery,
  ): Promise<ProductReadPage> {
    const tenantId =
      parseTenantId(
        query.tenantId,
      );

    const limit =
      query.limit ??
      DEFAULT_LIMIT;

    const offset =
      query.offset ??
      0;

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > MAX_LIMIT
    ) {
      throw new InvalidValueError(
        `Product list limit must be between 1 and ${MAX_LIMIT}`,
      );
    }

    if (
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      throw new InvalidValueError(
        'Product list offset must be zero or greater',
      );
    }

    return this.repository.findMany(
      tenantId,
      {
        limit,
        offset,
      },
    );
  }
}