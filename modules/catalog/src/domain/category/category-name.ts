import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MAX_CATEGORY_NAME_LENGTH = 80;

export class CategoryName {
  private constructor(
    public readonly value: string,
    public readonly normalizedValue: string,
  ) {}

  static create(
    value: string,
  ): CategoryName {
    const displayValue =
      value
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' ');

    if (
      displayValue.length === 0
    ) {
      throw new InvalidValueError(
        'Category name cannot be empty',
      );
    }

    if (
      displayValue.length >
      MAX_CATEGORY_NAME_LENGTH
    ) {
      throw new InvalidValueError(
        `Category name must have at most ${MAX_CATEGORY_NAME_LENGTH} characters`,
      );
    }

    const normalizedValue =
      displayValue.toLowerCase();

    return new CategoryName(
      displayValue,
      normalizedValue,
    );
  }

  equals(
    other: CategoryName,
  ): boolean {
    return (
      this.normalizedValue ===
      other.normalizedValue
    );
  }

  toString(): string {
    return this.value;
  }
}