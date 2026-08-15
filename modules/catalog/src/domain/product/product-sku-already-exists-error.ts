export class ProductSkuAlreadyExistsError
extends Error {
  constructor() {
    super(
      'Product SKU already exists for tenant',
    );

    this.name =
      'ProductSkuAlreadyExistsError';
  }
}