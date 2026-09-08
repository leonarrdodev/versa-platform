import {
  InvalidValueError,
} from '@versa/shared-kernel';

export const PRODUCT_DESCRIPTION_MAX_LENGTH =
  2000;

function normalizeDescription(
  value:
    string,
): string {
  return value
    .normalize('NFC')
    .replace(
      /\r\n?/g,
      '\n',
    )
    .trim();
}

export class ProductDescription {
  private constructor(
    public readonly value:
      string,
  ) {}

  static create(
    value:
      string
      | null
      | undefined,
  ): ProductDescription | null {
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
      normalizeDescription(
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
      PRODUCT_DESCRIPTION_MAX_LENGTH
    ) {
      throw new InvalidValueError(
        `Product description must have at most ${PRODUCT_DESCRIPTION_MAX_LENGTH} characters`,
      );
    }

    return new ProductDescription(
      normalized,
    );
  }
}