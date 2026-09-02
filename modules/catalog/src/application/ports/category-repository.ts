import type {
  Category,
} from '../../domain/category/category.js';

export interface CategoryRepository {
  insert(
    category: Category,
  ): Promise<void>;
}