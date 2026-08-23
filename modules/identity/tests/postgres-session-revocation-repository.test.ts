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
  PostgresSessionRevocationRepository,
  SessionTokenHash,
} from '../src/index.js';

describe(
  'PostgresSessionRevocationRepository',
  () => {
    it(
      'revokes only a non-revoked session matching the token hash',
      async () => {
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
          new PostgresSessionRevocationRepository(
            pool,
          );

        const tokenHash =
          SessionTokenHash.create(
            `sha256:${'a'.repeat(64)}`,
          );

        const revokedAt =
          new Date(
            '2026-08-23T21:30:00.000Z',
          );

        await repository
          .revokeByTokenHash(
            tokenHash,
            revokedAt,
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
          'UPDATE sessions',
        );

        expect(
          call[0],
        ).toContain(
          'revoked_at IS NULL',
        );

        expect(
          call[1],
        ).toEqual([
          tokenHash.value,
          revokedAt,
        ]);
      },
    );
  },
);  