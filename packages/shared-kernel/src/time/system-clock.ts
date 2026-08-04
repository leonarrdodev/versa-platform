import type { Clock } from './clock.js';

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}