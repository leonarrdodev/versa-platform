import type {
  CategoryStatus,
} from '../../domain/category/category-status.js';

export interface CreateCategoryResult {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly status: CategoryStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}