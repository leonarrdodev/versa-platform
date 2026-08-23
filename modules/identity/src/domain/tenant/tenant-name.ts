import {
  InvalidValueError,
} from '@versa/shared-kernel';

const MAX_TENANT_NAME_LENGTH = 120;

export class TenantName {
  private constructor(
    public readonly value: string,
  ) {}

  static create(
    value: string,
  ): TenantName {
    const normalizedValue =
      value
        .trim()
        .replace(/\s+/g, ' ');

    if (
      normalizedValue.length === 0
    ) {
      throw new InvalidValueError(
        'Tenant name cannot be empty',
      );
    }

    if (
      normalizedValue.length >
      MAX_TENANT_NAME_LENGTH
    ) {
      throw new InvalidValueError(
        `Tenant name must have at most ${MAX_TENANT_NAME_LENGTH} characters`,
      );
    }

    return new TenantName(
      normalizedValue,
    );
  }

  equals(
    other: TenantName,
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