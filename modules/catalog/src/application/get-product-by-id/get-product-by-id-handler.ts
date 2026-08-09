import {
  parseProductId,
} from '../../domain/identifiers/product-id.js';

import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  ProductReadModel,
  ProductReadRepository,
} from '../ports/product-read-repository.js';

export interface GetProductByIdQuery {
  readonly tenantId: string;
  readonly productId: string;
}

export class GetProductByIdHandler {
  constructor(
    private readonly repository:
      ProductReadRepository,
  ) {}

  async execute(
    query: GetProductByIdQuery,
  ): Promise<ProductReadModel | null> {
    const tenantId =
      parseTenantId(
        query.tenantId,
      );

    const productId =
      parseProductId(
        query.productId,
      );

    return this.repository.findById(
      tenantId,
      productId,
    );
  }
}