import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  MonotonicClock,
} from '../src/index.js';

import {
  measureDuration,
} from '../src/index.js';

class SequenceMonotonicClock
implements MonotonicClock {
  private index = 0;

  constructor(
    private readonly values:
      readonly number[],
  ) {}

  nowMs(): number {
    const value =
      this.values[this.index];

    if (value === undefined) {
      throw new Error(
        'No time configured',
      );
    }

    this.index += 1;

    return value;
  }
}

describe('measureDuration', () => {
  it('returns result and elapsed duration', async () => {
    const clock =
      new SequenceMonotonicClock([
        100,
        137.5,
      ]);

    const measurement =
      await measureDuration(
        clock,
        async () => {
          return 'completed';
        },
      );

    expect(measurement).toEqual({
      result: 'completed',
      durationMs: 37.5,
    });
  });
});