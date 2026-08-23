import type {
  Pool,
} from 'pg';

import type {
  SessionRevocationRepository,
} from '../../application/ports/session-revocation-repository.js';

import type {
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

export class PostgresSessionRevocationRepository
implements SessionRevocationRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async revokeByTokenHash(
    tokenHash: SessionTokenHash,
    revokedAt: Date,
  ): Promise<void> {
    await this.pool.query(
      `
        UPDATE sessions

        SET revoked_at = $2

        WHERE token_hash = $1
          AND revoked_at IS NULL
      `,
      [
        tokenHash.value,
        revokedAt,
      ],
    );
  }
}