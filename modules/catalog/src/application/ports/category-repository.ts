import type {
  Category,
} from '../../domain/category/category.js';

import type {
  CategoryId,
} from '../../domain/identifiers/category-id.js';

import type {
  TenantId,
} from '../../domain/identifiers/tenant-id.js';

export interface CategoryRepository {
  insert(
    category:
      Category,
  ): Promise<void>;

  isActiveById(
    tenantId:
      TenantId,

    categoryId:
      CategoryId,
  ): Promise<boolean>;
}