import type {
  Product,
} from '../../domain/product/product.js';

export interface ProductRepository {
  insert(product: Product): Promise<void>;
}