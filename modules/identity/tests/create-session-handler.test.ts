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
  CreateSessionHandler,
  SessionTokenHash,
} from '../src/index.js';

import type {
  Session,
  SessionRepository,
  SessionTokenGenerator,
  SessionTokenHasher,
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

class FakeSessionTokenGenerator
implements SessionTokenGenerator {
  generate(): string {
    return 'v1.test-session-token';
  }
}

class FakeSessionTokenHasher
implements SessionTokenHasher {
  readonly receivedTokens:
    string[] = [];

  hash(
    rawToken: string,
  ): SessionTokenHash {
    this.receivedTokens.push(
      rawToken,
    );

    return SessionTokenHash.create(
      `sha256:${'a'.repeat(64)}`,
    );
  }
}

class InMemorySessionRepository
implements SessionRepository {
  readonly sessions:
    Session[] = [];

  async insert(
    session: Session,
  ): Promise<void> {
    this.sessions.push(
      session,
    );
  }
}

const SESSION_ID =
  parseUuid(
    '11111111-1111-4111-8111-111111111111',
  );

const USER_ID =
  '22222222-2222-4222-8222-222222222222';

const TENANT_ID =
  '33333333-3333-4333-8333-333333333333';

const FIXED_DATE =
  new Date(
    '2026-08-23T16:50:00.000Z',
  );

const SESSION_DURATION_MS =
  7 * 24 * 60 * 60 * 1000;

function createDependencies() {
  const tokenHasher =
    new FakeSessionTokenHasher();

  const repository =
    new InMemorySessionRepository();

  const handler =
    new CreateSessionHandler({
      clock:
        new FixedClock(
          FIXED_DATE,
        ),

      idGenerator:
        new SequenceIdGenerator(
          SESSION_ID,
        ),

      tokenGenerator:
        new FakeSessionTokenGenerator(),

      tokenHasher,

      sessionRepository:
        repository,

      sessionDurationMs:
        SESSION_DURATION_MS,
    });

  return {
    handler,
    tokenHasher,
    repository,
  };
}

describe('CreateSessionHandler', () => {
  it('creates and returns a session token', async () => {
    const {
      handler,
    } = createDependencies();

    const result =
      await handler.execute({
        userId:
          USER_ID,

        activeTenantId:
          TENANT_ID,
      });

    expect(result).toEqual({
      sessionId:
        SESSION_ID,

      token:
        'v1.test-session-token',

      userId:
        USER_ID,

      activeTenantId:
        TENANT_ID,

      expiresAt:
        '2026-08-30T16:50:00.000Z',
    });
  });

  it('hashes the raw token before persistence', async () => {
    const {
      handler,
      tokenHasher,
    } = createDependencies();

    await handler.execute({
      userId:
        USER_ID,

      activeTenantId:
        TENANT_ID,
    });

    expect(
      tokenHasher
        .receivedTokens,
    ).toEqual([
      'v1.test-session-token',
    ]);
  });

  it('persists only the session containing the token hash', async () => {
    const {
      handler,
      repository,
    } = createDependencies();

    await handler.execute({
      userId:
        USER_ID,

      activeTenantId:
        TENANT_ID,
    });

    expect(
      repository.sessions,
    ).toHaveLength(1);

    const session =
      repository.sessions[0];

    expect(
      session
        ?.tokenHash
        .value,
    ).toBe(
      `sha256:${'a'.repeat(64)}`,
    );

    expect(
      session?.tokenHash.value,
    ).not.toContain(
      'test-session-token',
    );
  });

  it('supports a session without an active tenant', async () => {
    const {
      handler,
    } = createDependencies();

    const result =
      await handler.execute({
        userId:
          USER_ID,

        activeTenantId:
          null,
      });

    expect(
      result.activeTenantId,
    ).toBeNull();
  });

  it('rejects an invalid user id before persistence', async () => {
    const {
      handler,
      repository,
    } = createDependencies();

    await expect(
      handler.execute({
        userId:
          'invalid-user-id',

        activeTenantId:
          TENANT_ID,
      }),
    ).rejects.toThrow();

    expect(
      repository.sessions,
    ).toHaveLength(0);
  });
});