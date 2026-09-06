export class ProductCategoryNotAvailableError
extends Error {
  constructor() {
    super(
      'Product category is not available',
    );

    this.name =
      'ProductCategoryNotAvailableError';
  }
}