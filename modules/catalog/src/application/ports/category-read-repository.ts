import type {
  CategoryStatus,
} from '../../domain/category/category-status.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

export interface CategoryReadModel {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly name:
    string;

  readonly status:
    CategoryStatus;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;
}

export interface CategoryReadRepository {
  findActiveByTenant(
    tenantId:
      TenantId,
  ): Promise<
    readonly CategoryReadModel[]
  >;
}