import type {
  MonotonicClock,
} from './monotonic-clock.js';

export interface MeasuredResult<T> {
  readonly result: T;
  readonly durationMs: number;
}

export async function measureDuration<T>(
  clock: MonotonicClock,
  work: () => Promise<T>,
): Promise<MeasuredResult<T>> {
  const startedAt = clock.nowMs();

  const result = await work();

  const finishedAt = clock.nowMs();

  return {
    result,
    durationMs:
      finishedAt - startedAt,
  };
}