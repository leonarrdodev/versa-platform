import {
  performance,
} from 'node:perf_hooks';

export interface MonotonicClock {
  nowMs(): number;
}

export class PerformanceMonotonicClock
implements MonotonicClock {
  nowMs(): number {
    return performance.now();
  }
}