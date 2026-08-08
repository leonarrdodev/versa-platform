import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  Clock,
} from '@versa/shared-kernel';

import {
  parseUuid,
} from '@versa/shared-kernel';

import {
  StructuredLogger,
} from '../src/index.js';

import type {
  StructuredLog,
} from '../src/index.js';

class FixedClock implements Clock {
  now(): Date {
    return new Date(
      '2026-08-08T00:00:00.000Z',
    );
  }
}

const CORRELATION_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const EXECUTION_ID = parseUuid(
  '22222222-2222-4222-8222-222222222222',
);

describe('StructuredLogger', () => {
  it('creates a structured log', () => {
    const logs: StructuredLog[] = [];

    const logger =
      new StructuredLogger(
        'catalog',
        new FixedClock(),
        (log) => {
          logs.push(log);
        },
      );

    logger.info({
      message:
        'Product created',

      event:
        'product.created',

      context: {
        correlationId:
          CORRELATION_ID,

        executionId:
          EXECUTION_ID,
      },

      durationMs: 14,

      data: {
        sku: 'BLUSA-001',
      },
    });

    expect(logs).toEqual([
      {
        timestamp:
          '2026-08-08T00:00:00.000Z',

        level: 'info',

        service: 'catalog',

        message:
          'Product created',

        event:
          'product.created',

        correlationId:
          CORRELATION_ID,

        executionId:
          EXECUTION_ID,

        durationMs: 14,

        data: {
          sku: 'BLUSA-001',
        },
      },
    ]);
  });

  it('normalizes Error objects', () => {
    const logs: StructuredLog[] = [];

    const logger =
      new StructuredLogger(
        'catalog',
        new FixedClock(),
        (log) => {
          logs.push(log);
        },
      );

    logger.error({
      message:
        'Product creation failed',

      error:
        new TypeError('Invalid SKU'),
    });

    expect(
      logs[0]?.error?.name,
    ).toBe('TypeError');

    expect(
      logs[0]?.error?.message,
    ).toBe('Invalid SKU');
  });
});