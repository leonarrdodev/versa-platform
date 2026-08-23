import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MIN_PASSWORD_LENGTH = 15;
const MAX_PASSWORD_LENGTH = 128;

export class PasswordSecret {
  private constructor(
    private readonly normalizedValue:
      string,
  ) {}

  static create(
    value: string,
  ): PasswordSecret {
    const normalizedValue =
      value.normalize('NFC');

    const length =
      Array.from(
        normalizedValue,
      ).length;

    if (
      length <
      MIN_PASSWORD_LENGTH
    ) {
      throw new InvalidValueError(
        `Password must have at least ${MIN_PASSWORD_LENGTH} characters`,
      );
    }

    if (
      length >
      MAX_PASSWORD_LENGTH
    ) {
      throw new InvalidValueError(
        `Password must have at most ${MAX_PASSWORD_LENGTH} characters`,
      );
    }

    return new PasswordSecret(
      normalizedValue,
    );
  }

  exposeForHashing(): string {
    return this.normalizedValue;
  }
}