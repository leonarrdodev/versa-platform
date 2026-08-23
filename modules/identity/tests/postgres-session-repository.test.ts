import type {
  Pool,
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
  parseTenantId,
  parseUserId,
  PostgresSessionRepository,
  Session,
  SessionTokenHash,
} from '../src/index.js';

class FixedClock
implements Clock {
  constructor(
    private readonly fixedDate:
      Date,
  ) {}

  now(): Date {
    return new Date(
      this.fixedDate.getTime(),
    );
  }
}

class SequenceIdGenerator
implements IdGenerator {
  constructor(
    private readonly value:
      Uuid,
  ) {}

  generate(): Uuid {
    return this.value;
  }
}

const SESSION_ID =
  parseUuid(
    '11111111-1111-4111-8111-111111111111',
  );

const USER_ID =
  parseUserId(
    '22222222-2222-4222-8222-222222222222',
  );

const TENANT_ID =
  parseTenantId(
    '33333333-3333-4333-8333-333333333333',
  );

const CREATED_AT =
  new Date(
    '2026-08-23T16:50:00.000Z',
  );

const EXPIRES_AT =
  new Date(
    '2026-08-30T16:50:00.000Z',
  );

describe('PostgresSessionRepository', () => {
  it('inserts the session into PostgreSQL', async () => {
    const query =
      vi.fn()
        .mockResolvedValue({
          rows: [],
          rowCount: 1,
        });

    const pool = {
      query,
    } as unknown as Pool;

    const repository =
      new PostgresSessionRepository(
        pool,
      );

    const session =
      Session.create(
        {
          userId:
            USER_ID,

          activeTenantId:
            TENANT_ID,

          tokenHash:
            SessionTokenHash.create(
              `sha256:${'a'.repeat(64)}`,
            ),

          expiresAt:
            EXPIRES_AT,
        },
        {
          clock:
            new FixedClock(
              CREATED_AT,
            ),

          idGenerator:
            new SequenceIdGenerator(
              SESSION_ID,
            ),
        },
      );

    await repository.insert(
      session,
    );

    const call =
      query.mock.calls[0];

    if (
      call === undefined
    ) {
      throw new Error(
        'Expected PostgreSQL query',
      );
    }

    expect(
      call[0],
    ).toContain(
      'INSERT INTO sessions',
    );

    expect(
      call[1],
    ).toEqual([
      SESSION_ID,
      USER_ID,
      TENANT_ID,
      `sha256:${'a'.repeat(64)}`,
      CREATED_AT,
      EXPIRES_AT,
      CREATED_AT,
      null,
    ]);
  });
});