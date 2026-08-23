import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MAX_DISPLAY_NAME_LENGTH = 120;

export class DisplayName {
  private constructor(
    public readonly value: string,
  ) {}

  static create(
    value: string,
  ): DisplayName {
    const normalizedValue =
      value
        .trim()
        .replace(/\s+/g, ' ');

    if (
      normalizedValue.length === 0
    ) {
      throw new InvalidValueError(
        'Display name cannot be empty',
      );
    }

    if (
      normalizedValue.length >
      MAX_DISPLAY_NAME_LENGTH
    ) {
      throw new InvalidValueError(
        `Display name must have at most ${MAX_DISPLAY_NAME_LENGTH} characters`,
      );
    }

    return new DisplayName(
      normalizedValue,
    );
  }

  equals(
    other: DisplayName,
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