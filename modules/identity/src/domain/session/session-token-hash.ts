import {
  InvalidValueError,
} from '@versa/shared-kernel';

const SESSION_TOKEN_HASH_PATTERN =
  /^sha256:[0-9a-f]{64}$/;

export class SessionTokenHash {
  private constructor(
    public readonly value:
      string,
  ) {}

  static create(
    value: string,
  ): SessionTokenHash {
    if (
      !SESSION_TOKEN_HASH_PATTERN.test(
        value,
      )
    ) {
      throw new InvalidValueError(
        'Session token hash has an invalid format',
      );
    }

    return new SessionTokenHash(
      value,
    );
  }

  equals(
    other: SessionTokenHash,
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