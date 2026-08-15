import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MAX_PRODUCT_SKU_LENGTH = 64;

const PRODUCT_SKU_PATTERN =
  /^[A-Z0-9][A-Z0-9._-]*$/;

export class ProductSku {
  private constructor(
    public readonly value: string,
  ) {}

  static create(
    value: string,
  ): ProductSku {
    const normalizedValue =
      value
        .trim()
        .toUpperCase();

    if (
      normalizedValue.length === 0
    ) {
      throw new InvalidValueError(
        'Product SKU cannot be empty',
      );
    }

    if (
      normalizedValue.length >
      MAX_PRODUCT_SKU_LENGTH
    ) {
      throw new InvalidValueError(
        `Product SKU must have at most ${MAX_PRODUCT_SKU_LENGTH} characters`,
      );
    }

    if (
      !PRODUCT_SKU_PATTERN.test(
        normalizedValue,
      )
    ) {
      throw new InvalidValueError(
        'Product SKU contains invalid characters',
      );
    }

    return new ProductSku(
      normalizedValue,
    );
  }

  equals(
    other: ProductSku,
  ): boolean {
    return (
      this.value ===
      other.value
    );
  }

  toString(): string {
    return this.value;
  }
}