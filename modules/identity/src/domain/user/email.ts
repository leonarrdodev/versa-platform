import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MAX_EMAIL_LENGTH = 254;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(
    public readonly value: string,
    public readonly normalizedValue: string,
  ) {}

  static create(
    value: string,
  ): Email {
    const trimmedValue =
      value.trim();

    if (
      trimmedValue.length === 0
    ) {
      throw new InvalidValueError(
        'Email cannot be empty',
      );
    }

    if (
      trimmedValue.length >
      MAX_EMAIL_LENGTH
    ) {
      throw new InvalidValueError(
        `Email must have at most ${MAX_EMAIL_LENGTH} characters`,
      );
    }

    if (
      !EMAIL_PATTERN.test(
        trimmedValue,
      )
    ) {
      throw new InvalidValueError(
        'Email has an invalid format',
      );
    }

    const normalizedValue =
      trimmedValue.toLowerCase();

    return new Email(
      trimmedValue,
      normalizedValue,
    );
  }

  equals(
    other: Email,
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