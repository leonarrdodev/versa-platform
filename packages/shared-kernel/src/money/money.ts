import {
  InvalidValueError,
} from '../errors/invalid-value-error.js';

/*
 * Representa um valor monetário
 * armazenado internamente em centavos.
 *
 * Exemplos:
 *
 * R$ 34,90 -> 3490
 * R$ 100,00 -> 10000
 * R$ 0,01 -> 1
 */
export class Money {
  private constructor(
    private readonly centsValue:
      number,
  ) {}

  static fromCents(
    cents:
      number,
  ): Money {
    if (
      !Number.isInteger(
        cents,
      )
    ) {
      throw new InvalidValueError(
        'Money cents must be an integer',
      );
    }

    if (
      cents < 0
    ) {
      throw new InvalidValueError(
        'Money cannot be negative',
      );
    }

    if (
      !Number.isSafeInteger(
        cents,
      )
    ) {
      throw new InvalidValueError(
        'Money cents must be a safe integer',
      );
    }

    return new Money(
      cents,
    );
  }

  get cents():
    number {
    return this.centsValue;
  }

  isZero():
    boolean {
    return this.centsValue === 0;
  }

  equals(
    other:
      Money,
  ): boolean {
    return (
      this.centsValue ===
      other.centsValue
    );
  }
}