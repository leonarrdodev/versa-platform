import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  createChildExecutionContext,
  createRootExecutionContext,
} from '../src/index.js';

class SequenceIdGenerator
implements IdGenerator {
  private index = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[this.index];

    if (value === undefined) {
      throw new Error(
        'No UUID configured',
      );
    }

    this.index += 1;

    return value;
  }
}

const CORRELATION_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const ROOT_EXECUTION_ID = parseUuid(
  '22222222-2222-4222-8222-222222222222',
);

const CHILD_EXECUTION_ID = parseUuid(
  '33333333-3333-4333-8333-333333333333',
);

describe('ExecutionContext', () => {
  it('creates a root execution context', () => {
    const generator =
      new SequenceIdGenerator([
        CORRELATION_ID,
        ROOT_EXECUTION_ID,
      ]);

    const context =
      createRootExecutionContext(
        generator,
      );

    expect(context).toEqual({
      correlationId:
        CORRELATION_ID,

      executionId:
        ROOT_EXECUTION_ID,
    });
  });

  it('creates a child preserving correlation', () => {
    const generator =
      new SequenceIdGenerator([
        CHILD_EXECUTION_ID,
      ]);

    const parent = {
      correlationId:
        CORRELATION_ID,

      executionId:
        ROOT_EXECUTION_ID,
    };

    const child =
      createChildExecutionContext(
        parent,
        generator,
      );

    expect(child).toEqual({
      correlationId:
        CORRELATION_ID,

      executionId:
        CHILD_EXECUTION_ID,

      causationId:
        ROOT_EXECUTION_ID,
    });
  });
});