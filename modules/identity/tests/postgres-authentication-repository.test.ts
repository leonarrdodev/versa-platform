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
  PostgresAuthenticationRepository,
} from '../src/index.js';

describe('PostgresAuthenticationRepository', () => {
  it('returns null when the email does not exist', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [],
        rowCount: 0,
      });

    const pool = {
      query,
    } as unknown as Pool;

    const repository =
      new PostgresAuthenticationRepository(
        pool,
      );

    const result =
      await repository
        .findByNormalizedEmail(
          'leo@example.com',
        );

    expect(result).toBeNull();

    expect(query).toHaveBeenCalledOnce();

    const call =
      query.mock.calls[0];

    if (call === undefined) {
      throw new Error(
        'Expected PostgreSQL query',
      );
    }

    expect(call[1]).toEqual([
      'leo@example.com',
    ]);
  });

  it('returns authentication identity with memberships', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [
          {
            userId:
              '11111111-1111-4111-8111-111111111111',

            email:
              'Leo@Example.COM',

            normalizedEmail:
              'leo@example.com',

            displayName:
              'Leonardo',

            userStatus:
              'active',

            passwordHash:
              '$argon2id$fake',

            tenantId:
              '22222222-2222-4222-8222-222222222222',

            tenantStatus:
              'active',

            membershipRole:
              'owner',

            membershipStatus:
              'active',
          },

          {
            userId:
              '11111111-1111-4111-8111-111111111111',

            email:
              'Leo@Example.COM',

            normalizedEmail:
              'leo@example.com',

            displayName:
              'Leonardo',

            userStatus:
              'active',

            passwordHash:
              '$argon2id$fake',

            tenantId:
              '33333333-3333-4333-8333-333333333333',

            tenantStatus:
              'suspended',

            membershipRole:
              'admin',

            membershipStatus:
              'active',
          },
        ],
        rowCount: 2,
      });

    const pool = {
      query,
    } as unknown as Pool;

    const repository =
      new PostgresAuthenticationRepository(
        pool,
      );

    const result =
      await repository
        .findByNormalizedEmail(
          'leo@example.com',
        );

    expect(result).toEqual({
      userId:
        '11111111-1111-4111-8111-111111111111',

      email:
        'Leo@Example.COM',

      normalizedEmail:
        'leo@example.com',

      displayName:
        'Leonardo',

      userStatus:
        'active',

      passwordHash:
        '$argon2id$fake',

      memberships: [
        {
          tenantId:
            '22222222-2222-4222-8222-222222222222',

          tenantStatus:
            'active',

          role:
            'owner',

          status:
            'active',
        },

        {
          tenantId:
            '33333333-3333-4333-8333-333333333333',

          tenantStatus:
            'suspended',

          role:
            'admin',

          status:
            'active',
        },
      ],
    });
  });

  it('supports a user without memberships', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [
          {
            userId:
              '11111111-1111-4111-8111-111111111111',

            email:
              'leo@example.com',

            normalizedEmail:
              'leo@example.com',

            displayName:
              'Leonardo',

            userStatus:
              'active',

            passwordHash:
              '$argon2id$fake',

            tenantId:
              null,

            tenantStatus:
              null,

            membershipRole:
              null,

            membershipStatus:
              null,
          },
        ],
        rowCount: 1,
      });

    const pool = {
      query,
    } as unknown as Pool;

    const repository =
      new PostgresAuthenticationRepository(
        pool,
      );

    const result =
      await repository
        .findByNormalizedEmail(
          'leo@example.com',
        );

    expect(
      result?.memberships,
    ).toEqual([]);
  });

  it('rejects incomplete membership data from the database', async () => {
    const query = vi
      .fn()
      .mockResolvedValue({
        rows: [
          {
            userId:
              '11111111-1111-4111-8111-111111111111',

            email:
              'leo@example.com',

            normalizedEmail:
              'leo@example.com',

            displayName:
              'Leonardo',

            userStatus:
              'active',

            passwordHash:
              '$argon2id$fake',

            tenantId:
              '22222222-2222-4222-8222-222222222222',

            tenantStatus:
              null,

            membershipRole:
              'owner',

            membershipStatus:
              'active',
          },
        ],
        rowCount: 1,
      });

    const pool = {
      query,
    } as unknown as Pool;

    const repository =
      new PostgresAuthenticationRepository(
        pool,
      );

    await expect(
      repository
        .findByNormalizedEmail(
          'leo@example.com',
        ),
    ).rejects.toThrow(
      'Incomplete membership data returned from database',
    );
  });
});