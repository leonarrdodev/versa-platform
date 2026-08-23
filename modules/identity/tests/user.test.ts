import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  DisplayName,
  Email,
  User,
} from '../src/index.js';

class FixedClock implements Clock {
  constructor(
    private readonly fixedDate: Date,
  ) {}

  now(): Date {
    return new Date(
      this.fixedDate.getTime(),
    );
  }
}

class SequenceIdGenerator implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values: readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[this.currentIndex];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

const USER_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const FIXED_DATE = new Date(
  '2026-08-20T23:00:00.000Z',
);

function createUser(): User {
  const clock =
    new FixedClock(FIXED_DATE);

  const idGenerator =
    new SequenceIdGenerator([
      USER_ID,
    ]);

  return User.create(
    {
      email: Email.create(
        'Leo@Example.COM',
      ),
      displayName:
        DisplayName.create(
          'Leonardo Silva',
        ),
    },
    {
      clock,
      idGenerator,
    },
  );
}

describe('User', () => {
  it('creates a user with its domain data', () => {
    const user = createUser();

    expect(user.id).toBe(USER_ID);

    expect(user.email.value).toBe(
      'Leo@Example.COM',
    );

    expect(
      user.email.normalizedValue,
    ).toBe(
      'leo@example.com',
    );

    expect(
      user.displayName.value,
    ).toBe(
      'Leonardo Silva',
    );
  });

  it('starts the user with active status', () => {
    const user = createUser();

    expect(user.status).toBe(
      'active',
    );
  });

  it('uses the injected clock for timestamps', () => {
    const user = createUser();

    expect(
      user.createdAt.toISOString(),
    ).toBe(
      '2026-08-20T23:00:00.000Z',
    );

    expect(
      user.updatedAt.toISOString(),
    ).toBe(
      '2026-08-20T23:00:00.000Z',
    );
  });

  it('protects createdAt against external mutation', () => {
    const user = createUser();

    const createdAt =
      user.createdAt;

    createdAt.setFullYear(2000);

    expect(
      user.createdAt.toISOString(),
    ).toBe(
      '2026-08-20T23:00:00.000Z',
    );
  });

  it('protects updatedAt against external mutation', () => {
    const user = createUser();

    const updatedAt =
      user.updatedAt;

    updatedAt.setFullYear(2000);

    expect(
      user.updatedAt.toISOString(),
    ).toBe(
      '2026-08-20T23:00:00.000Z',
    );
  });
});