import type {
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
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
  PostgresUserRepository,
  User,
  UserEmailAlreadyExistsError,
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
    private readonly values:
      readonly Uuid[],
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
  '2026-08-23T14:00:00.000Z',
);

function createUser(): User {
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
      clock:
        new FixedClock(FIXED_DATE),

      idGenerator:
        new SequenceIdGenerator([
          USER_ID,
        ]),
    },
  );
}

describe('PostgresUserRepository', () => {
  it('inserts the user into PostgreSQL', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [],
        rowCount: 1,
      });

    const client = {
      query,
    } as unknown as PoolClient;

    const repository =
      new PostgresUserRepository(
        client,
      );

    const user = createUser();

    await repository.insert(user);

    expect(
      query,
    ).toHaveBeenCalledOnce();

    const call =
      query.mock.calls[0];

    if (call === undefined) {
      throw new Error(
        'Expected PostgreSQL query',
      );
    }

    const [
      sql,
      values,
    ] = call;

    expect(sql).toContain(
      'INSERT INTO users',
    );

    expect(values).toEqual([
      USER_ID,
      'Leo@Example.COM',
      'leo@example.com',
      'Leonardo Silva',
      'active',
      FIXED_DATE,
      FIXED_DATE,
    ]);
  });

  it('translates normalized email uniqueness violation', async () => {
    const query = vi
      .fn()
      .mockRejectedValue({
        code: '23505',
        constraint:
          'users_normalized_email_unique',
      });

    const client = {
      query,
    } as unknown as PoolClient;

    const repository =
      new PostgresUserRepository(
        client,
      );

    await expect(
      repository.insert(
        createUser(),
      ),
    ).rejects.toBeInstanceOf(
      UserEmailAlreadyExistsError,
    );
  });

  it('does not translate unrelated PostgreSQL errors', async () => {
    const failure = {
      code: '23505',
      constraint:
        'some_other_constraint',
    };

    const query = vi
      .fn()
      .mockRejectedValue(
        failure,
      );

    const client = {
      query,
    } as unknown as PoolClient;

    const repository =
      new PostgresUserRepository(
        client,
      );

    await expect(
      repository.insert(
        createUser(),
      ),
    ).rejects.toBe(
      failure,
    );
  });
});