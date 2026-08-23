import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  Clock,
} from '@versa/shared-kernel';

import {
  RevokeSessionHandler,
  SessionTokenHash,
} from '../src/index.js';

import type {
  SessionRevocationRepository,
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

class InMemorySessionRevocationRepository
implements SessionRevocationRepository {
  readonly revocations: {
    tokenHash:
      SessionTokenHash;

    revokedAt:
      Date;
  }[] = [];

  async revokeByTokenHash(
    tokenHash:
      SessionTokenHash,

    revokedAt:
      Date,
  ): Promise<void> {
    this.revocations.push({
      tokenHash,

      revokedAt:
        new Date(
          revokedAt.getTime(),
        ),
    });
  }
}

const NOW =
  new Date(
    '2026-08-23T21:30:00.000Z',
  );

function createHandler() {
  const tokenHasher =
    new FakeSessionTokenHasher();

  const repository =
    new InMemorySessionRevocationRepository();

  const handler =
    new RevokeSessionHandler({
      clock:
        new FixedClock(
          NOW,
        ),

      tokenHasher,

      revocationRepository:
        repository,
    });

  return {
    handler,
    tokenHasher,
    repository,
  };
}

describe(
  'RevokeSessionHandler',
  () => {
    it(
      'hashes and revokes the session token',
      async () => {
        const {
          handler,
          tokenHasher,
          repository,
        } = createHandler();

        await handler.execute(
          'v1.secret-token',
        );

        expect(
          tokenHasher
            .receivedTokens,
        ).toEqual([
          'v1.secret-token',
        ]);

        expect(
          repository.revocations,
        ).toHaveLength(1);

        expect(
          repository
            .revocations[0]
            ?.tokenHash
            .value,
        ).toBe(
          `sha256:${'a'.repeat(64)}`,
        );

        expect(
          repository
            .revocations[0]
            ?.revokedAt
            .toISOString(),
        ).toBe(
          NOW.toISOString(),
        );
      },
    );

    it(
      'treats an empty token as already logged out',
      async () => {
        const {
          handler,
          tokenHasher,
          repository,
        } = createHandler();

        await handler.execute('');

        expect(
          tokenHasher
            .receivedTokens,
        ).toHaveLength(0);

        expect(
          repository.revocations,
        ).toHaveLength(0);
      },
    );
  },
);