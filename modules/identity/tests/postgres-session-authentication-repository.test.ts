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
  PostgresSessionAuthenticationRepository,
  SessionTokenHash,
} from '../src/index.js';

const TOKEN_HASH =
  SessionTokenHash.create(
    `sha256:${'a'.repeat(64)}`,
  );

describe(
  'PostgresSessionAuthenticationRepository',
  () => {
    it(
      'returns null when the session does not exist',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rows: [],
              rowCount: 0,
            });

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresSessionAuthenticationRepository(
            pool,
          );

        const result =
          await repository
            .findByTokenHash(
              TOKEN_HASH,
            );

        expect(
          result,
        ).toBeNull();

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
          call[1],
        ).toEqual([
          TOKEN_HASH.value,
        ]);
      },
    );

    it(
      'returns session authentication with active tenant data',
      async () => {
        const row = {
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

        const query =
          vi.fn()
            .mockResolvedValue({
              rows: [
                row,
              ],

              rowCount: 1,
            });

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresSessionAuthenticationRepository(
            pool,
          );

        const result =
          await repository
            .findByTokenHash(
              TOKEN_HASH,
            );

        expect(result).toEqual(
          row,
        );
      },
    );

    it(
      'supports a session without active tenant',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rows: [
                {
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
                    null,

                  tenantName:
                    null,

                  tenantStatus:
                    null,

                  membershipRole:
                    null,

                  membershipStatus:
                    null,

                  createdAt:
                    new Date(),

                  expiresAt:
                    new Date(),

                  lastSeenAt:
                    new Date(),

                  revokedAt:
                    null,
                },
              ],

              rowCount: 1,
            });

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresSessionAuthenticationRepository(
            pool,
          );

        const result =
          await repository
            .findByTokenHash(
              TOKEN_HASH,
            );

        expect(
          result?.activeTenantId,
        ).toBeNull();

        expect(
          result?.tenantStatus,
        ).toBeNull();

        expect(
          result?.membershipRole,
        ).toBeNull();

        expect(
          result?.membershipStatus,
        ).toBeNull();
      },
    );

    it(
      'rejects incomplete active tenant data',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rows: [
                {
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
                    null,

                  membershipStatus:
                    'active',

                  createdAt:
                    new Date(),

                  expiresAt:
                    new Date(),

                  lastSeenAt:
                    new Date(),

                  revokedAt:
                    null,
                },
              ],

              rowCount: 1,
            });

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresSessionAuthenticationRepository(
            pool,
          );

        await expect(
          repository
            .findByTokenHash(
              TOKEN_HASH,
            ),
        ).rejects.toThrow(
          'Incomplete active tenant data returned from database',
        );
      },
    );

    it(
      'rejects malformed status data returned from PostgreSQL',
      async () => {
        const query =
          vi.fn()
            .mockResolvedValue({
              rows: [
                {
                  sessionId:
                    '11111111-1111-4111-8111-111111111111',

                  userId:
                    '22222222-2222-4222-8222-222222222222',

                  email:
                    'leo@example.com',

                  displayName:
                    'Leonardo',

                  userStatus:
                    'unknown',

                  activeTenantId:
                    null,

                  tenantName:
                    null,

                  tenantStatus:
                    null,

                  membershipRole:
                    null,

                  membershipStatus:
                    null,

                  createdAt:
                    new Date(),

                  expiresAt:
                    new Date(),

                  lastSeenAt:
                    new Date(),

                  revokedAt:
                    null,
                },
              ],

              rowCount: 1,
            });

        const pool = {
          query,
        } as unknown as Pool;

        const repository =
          new PostgresSessionAuthenticationRepository(
            pool,
          );

        await expect(
          repository
            .findByTokenHash(
              TOKEN_HASH,
            ),
        ).rejects.toThrow(
          'Invalid user status returned from database',
        );
      },
    );
  },
);