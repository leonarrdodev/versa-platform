import {
  InvalidValueError,
} from '@versa/shared-kernel';

export const PRODUCT_BRAND_MAX_LENGTH =
  120;

function normalizeBrand(
  value:
    string,
): string {
  return value
    .normalize('NFC')
    .trim()
    .replace(
      /\s+/g,
      ' ',
    );
}

export class ProductBrand {
  private constructor(
    public readonly value:
      string,
  ) {}

  static create(
    value:
      string
      | null
      | undefined,
  ): ProductBrand | null {
    if (
      value ===
        null
      ||
      value ===
        undefined
    ) {
      return null;
    }

    const normalized =
      normalizeBrand(
        value,
      );

    if (
      normalized.length ===
      0
    ) {
      return null;
    }

    if (
      normalized.length >
      PRODUCT_BRAND_MAX_LENGTH
    ) {
      throw new InvalidValueError(
        `Product brand must have at most ${PRODUCT_BRAND_MAX_LENGTH} characters`,
      );
    }

    return new ProductBrand(
      normalized,
    );
  }
}