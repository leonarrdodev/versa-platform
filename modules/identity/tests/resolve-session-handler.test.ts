import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  Clock,
} from '@versa/shared-kernel';

import {
  InvalidSessionError,
  ResolveSessionHandler,
  SessionTokenHash,
} from '../src/index.js';

import type {
  SessionAuthentication,
  SessionAuthenticationRepository,
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

class InMemorySessionAuthenticationRepository
implements SessionAuthenticationRepository {
  readonly receivedHashes:
    SessionTokenHash[] = [];

  constructor(
    private readonly authentication:
      SessionAuthentication | null,
  ) {}

  async findByTokenHash(
    tokenHash: SessionTokenHash,
  ): Promise<
    SessionAuthentication | null
  > {
    this.receivedHashes.push(
      tokenHash,
    );

    return this.authentication;
  }
}

const NOW =
  new Date(
    '2026-08-23T21:00:00.000Z',
  );

const ACTIVE_SESSION:
SessionAuthentication = {
  sessionId:
    '11111111-1111-4111-8111-111111111111',

  userId:
    '22222222-2222-4222-8222-222222222222',

  email:
    'leo@example.com',

  displayName:
    'Leonardo',

  userStatus:
    'active',

  activeTenantId:
    '33333333-3333-4333-8333-333333333333',
    tenantName:
  'Versa Wear',

  tenantStatus:
    'active',

  membershipRole:
    'owner',

  membershipStatus:
    'active',

  createdAt:
    new Date(
      '2026-08-23T20:00:00.000Z',
    ),

  expiresAt:
    new Date(
      '2026-08-30T20:00:00.000Z',
    ),

  lastSeenAt:
    new Date(
      '2026-08-23T20:00:00.000Z',
    ),

  revokedAt:
    null,
};

function createHandler(
  authentication:
    SessionAuthentication | null,
) {
  const tokenHasher =
    new FakeSessionTokenHasher();

  const repository =
    new InMemorySessionAuthenticationRepository(
      authentication,
    );

  const handler =
    new ResolveSessionHandler({
      clock:
        new FixedClock(
          NOW,
        ),

      tokenHasher,

      authenticationRepository:
        repository,
    });

  return {
    handler,
    tokenHasher,
    repository,
  };
}

describe(
  'ResolveSessionHandler',
  () => {
    it(
      'resolves an active session with its current tenant',
      async () => {
        const {
          handler,
        } = createHandler(
          ACTIVE_SESSION,
        );

        const result =
          await handler.execute(
            'v1.valid-token',
          );

        expect(result).toEqual({
          sessionId:
            '11111111-1111-4111-8111-111111111111',

          user: {
            id:
              '22222222-2222-4222-8222-222222222222',

            email:
              'leo@example.com',

            displayName:
              'Leonardo',
          },

          activeTenant: {
            id:
              '33333333-3333-4333-8333-333333333333',
              
              name:  
                'Versa Wear',

            role:
              'owner',
          },

          expiresAt:
            '2026-08-30T20:00:00.000Z',
        });
      },
    );

    it(
      'hashes the raw token before repository lookup',
      async () => {
        const {
          handler,
          tokenHasher,
          repository,
        } = createHandler(
          ACTIVE_SESSION,
        );

        await handler.execute(
          'v1.raw-secret',
        );

        expect(
          tokenHasher
            .receivedTokens,
        ).toEqual([
          'v1.raw-secret',
        ]);

        expect(
          repository
            .receivedHashes[0]
            ?.value,
        ).toBe(
          `sha256:${'a'.repeat(64)}`,
        );
      },
    );

    it(
      'supports an authenticated session without an active tenant',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          activeTenantId:
            null,

          tenantStatus:
            null,

          membershipRole:
            null,

          membershipStatus:
            null,
        });

        const result =
          await handler.execute(
            'v1.valid-token',
          );

        expect(
          result.activeTenant,
        ).toBeNull();
      },
    );

    it(
      'rejects an unknown session',
      async () => {
        const {
          handler,
        } = createHandler(
          null,
        );

        await expect(
          handler.execute(
            'v1.unknown-token',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );

    it(
      'rejects an empty token before repository lookup',
      async () => {
        const {
          handler,
          tokenHasher,
          repository,
        } = createHandler(
          ACTIVE_SESSION,
        );

        await expect(
          handler.execute(''),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );

        expect(
          tokenHasher
            .receivedTokens,
        ).toHaveLength(0);

        expect(
          repository
            .receivedHashes,
        ).toHaveLength(0);
      },
    );

    it(
      'rejects an expired session',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          expiresAt:
            new Date(
              NOW.getTime(),
            ),
        });

        await expect(
          handler.execute(
            'v1.expired-token',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );

    it(
      'rejects a revoked session',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          revokedAt:
            new Date(
              '2026-08-23T20:30:00.000Z',
            ),
        });

        await expect(
          handler.execute(
            'v1.revoked-token',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );

    it(
      'rejects a disabled user',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          userStatus:
            'disabled',
        });

        await expect(
          handler.execute(
            'v1.disabled-user',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );

    it(
      'rejects a suspended active tenant',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          tenantStatus:
            'suspended',
        });

        await expect(
          handler.execute(
            'v1.suspended-tenant',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );

    it(
      'rejects a suspended membership',
      async () => {
        const {
          handler,
        } = createHandler({
          ...ACTIVE_SESSION,

          membershipStatus:
            'suspended',
        });

        await expect(
          handler.execute(
            'v1.suspended-membership',
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );
  },
);