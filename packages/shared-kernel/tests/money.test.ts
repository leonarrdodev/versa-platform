import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  InvalidValueError,
  Money,
} from '../src/index.js';

describe(
  'Money',
  () => {
    it(
      'creates money from integer cents',
      () => {
        const money =
          Money.fromCents(
            3490,
          );

        expect(
          money.cents,
        ).toBe(
          3490,
        );
      },
    );

    it(
      'allows zero',
      () => {
        const money =
          Money.fromCents(
            0,
          );

        expect(
          money.isZero(),
        ).toBe(
          true,
        );
      },
    );

    it(
      'rejects negative values',
      () => {
        expect(
          () =>
            Money.fromCents(
              -1,
            ),
        ).toThrow(
          InvalidValueError,
        );
      },
    );

    it(
      'rejects decimal cents',
      () => {
        expect(
          () =>
            Money.fromCents(
              34.9,
            ),
        ).toThrow(
          InvalidValueError,
        );
      },
    );

    it(
      'rejects unsafe integers',
      () => {
        expect(
          () =>
            Money.fromCents(
              Number.MAX_SAFE_INTEGER +
              1,
            ),
        ).toThrow(
          InvalidValueError,
        );
      },
    );

    it(
      'compares equal monetary values',
      () => {
        const first =
          Money.fromCents(
            3490,
          );

        const second =
          Money.fromCents(
            3490,
          );

        expect(
          first.equals(
            second,
          ),
        ).toBe(
          true,
        );
      },
    );

    it(
      'compares different monetary values',
      () => {
        const first =
          Money.fromCents(
            3490,
          );

        const second =
          Money.fromCents(
            3500,
          );

        expect(
          first.equals(
            second,
          ),
        ).toBe(
          false,
        );
      },
    );
  },
);