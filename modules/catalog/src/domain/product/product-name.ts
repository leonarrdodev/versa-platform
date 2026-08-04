const MAX_PRODUCT_NAME_LENGTH = 120;

export class ProductName {
  private constructor(
    public readonly value: string,
  ) {}

  static create(value: string): ProductName {
    const normalizedValue = value
      .trim()
      .replace(/\s+/g, ' ');

    if (normalizedValue.length === 0) {
      throw new TypeError('Product name cannot be empty');
    }

    if (normalizedValue.length > MAX_PRODUCT_NAME_LENGTH) {
      throw new TypeError(
        `Product name must have at most ${MAX_PRODUCT_NAME_LENGTH} characters`,
      );
    }

    return new ProductName(normalizedValue);
  }

  equals(other: ProductName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}