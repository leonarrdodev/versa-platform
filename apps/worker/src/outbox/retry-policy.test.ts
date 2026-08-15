import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  decideOutboxRetry,
} from './retry-policy.js';

const policy = {
  maxAttempts:
    5,

  baseDelayMs:
    1_000,

  maxDelayMs:
    60_000,
} as const;

describe(
  'decideOutboxRetry',
  () => {
    it(
      'schedules 1 second after first failure',
      () => {
        const decision =
          decideOutboxRetry(
            0,
            policy,
          );

        expect(
          decision,
        ).toEqual({
          attempt:
            1,

          deadLetter:
            false,

          nextDelayMs:
            1_000,
        });
      },
    );

    it(
      'uses exponential backoff',
      () => {
        expect(
          decideOutboxRetry(
            1,
            policy,
          ).nextDelayMs,
        ).toBe(
          2_000,
        );

        expect(
          decideOutboxRetry(
            2,
            policy,
          ).nextDelayMs,
        ).toBe(
          4_000,
        );

        expect(
          decideOutboxRetry(
            3,
            policy,
          ).nextDelayMs,
        ).toBe(
          8_000,
        );
      },
    );

    it(
      'dead-letters after reaching max attempts',
      () => {
        const decision =
          decideOutboxRetry(
            4,
            policy,
          );

        expect(
          decision,
        ).toEqual({
          attempt:
            5,

          deadLetter:
            true,

          nextDelayMs:
            null,
        });
      },
    );

    it(
      'caps exponential delay at maxDelayMs',
      () => {
        const decision =
          decideOutboxRetry(
            4,
            {
              maxAttempts:
                10,

              baseDelayMs:
                1_000,

              maxDelayMs:
                3_000,
            },
          );

        expect(
          decision,
        ).toEqual({
          attempt:
            5,

          deadLetter:
            false,

          nextDelayMs:
            3_000,
        });
      },
    );
  },
);