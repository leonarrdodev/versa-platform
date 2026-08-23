import {
  InvalidValueError,
} from '@versa/shared-kernel';

export class PasswordHash {
  private constructor(
    public readonly value: string,
  ) {}

  static create(
    value: string,
  ): PasswordHash {
    const normalizedValue =
      value.trim();

    if (
      normalizedValue.length === 0
    ) {
      throw new InvalidValueError(
        'Password hash cannot be empty',
      );
    }

    return new PasswordHash(
      normalizedValue,
    );
  }

  equals(
    other: PasswordHash,
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