import {
  parseTenantId,
} from '../../domain/identifiers/tenant-id.js';

import type {
  CategoryReadModel,
  CategoryReadRepository,
} from '../ports/category-read-repository.js';

export interface GetCategoriesQuery {
  readonly tenantId:
    string;
}

export class GetCategoriesHandler {
  constructor(
    private readonly repository:
      CategoryReadRepository,
  ) {}

  async execute(
    query:
      GetCategoriesQuery,
  ): Promise<
    readonly CategoryReadModel[]
  > {
    const tenantId =
      parseTenantId(
        query.tenantId,
      );

    return this.repository
      .findActiveByTenant(
        tenantId,
      );
  }
}