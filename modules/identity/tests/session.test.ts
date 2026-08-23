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
  parseTenantId,
  parseUserId,
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
  private currentIndex = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[
        this.currentIndex
      ];

    if (
      value === undefined
    ) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
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

const FIXED_DATE =
  new Date(
    '2026-08-23T16:40:00.000Z',
  );

const EXPIRES_AT =
  new Date(
    '2026-08-30T16:40:00.000Z',
  );

function createSession():
  Session {
  return Session.create(
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
          FIXED_DATE,
        ),

      idGenerator:
        new SequenceIdGenerator([
          SESSION_ID,
        ]),
    },
  );
}

describe('Session', () => {
  it('creates a session with its domain data', () => {
    const session =
      createSession();

    expect(
      session.id,
    ).toBe(
      SESSION_ID,
    );

    expect(
      session.userId,
    ).toBe(
      USER_ID,
    );

    expect(
      session.activeTenantId,
    ).toBe(
      TENANT_ID,
    );

    expect(
      session.revokedAt,
    ).toBeNull();
  });

  it('uses the creation time as initial last seen time', () => {
    const session =
      createSession();

    expect(
      session.lastSeenAt
        .toISOString(),
    ).toBe(
      FIXED_DATE.toISOString(),
    );
  });

  it('starts active before expiration', () => {
    const session =
      createSession();

    expect(
      session.isActive(
        new Date(
          '2026-08-24T00:00:00.000Z',
        ),
      ),
    ).toBe(true);
  });

  it('is expired at its expiration instant', () => {
    const session =
      createSession();

    expect(
      session.isExpired(
        EXPIRES_AT,
      ),
    ).toBe(true);

    expect(
      session.isActive(
        EXPIRES_AT,
      ),
    ).toBe(false);
  });

  it('rejects expiration before creation', () => {
    expect(
      () =>
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
              new Date(
                '2026-08-22T00:00:00.000Z',
              ),
          },
          {
            clock:
              new FixedClock(
                FIXED_DATE,
              ),

            idGenerator:
              new SequenceIdGenerator([
                SESSION_ID,
              ]),
          },
        ),
    ).toThrow(
      'Session expiration must be after creation',
    );
  });

  it('protects dates against external mutation', () => {
    const session =
      createSession();

    const expiresAt =
      session.expiresAt;

    expiresAt.setFullYear(
      2000,
    );

    expect(
      session.expiresAt
        .toISOString(),
    ).toBe(
      EXPIRES_AT.toISOString(),
    );
  });
});