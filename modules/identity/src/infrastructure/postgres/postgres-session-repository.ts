import type {
  Pool,
} from 'pg';

import type {
  SessionRepository,
} from '../../application/ports/session-repository.js';

import type {
  Session,
} from '../../domain/session/session.js';

export class PostgresSessionRepository
implements SessionRepository {
  constructor(
    private readonly pool:
      Pool,
  ) {}

  async insert(
    session: Session,
  ): Promise<void> {
    await this.pool.query(
      `
        INSERT INTO sessions (
          id,
          user_id,
          active_tenant_id,
          token_hash,
          created_at,
          expires_at,
          last_seen_at,
          revoked_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8
        )
      `,
      [
        session.id,
        session.userId,
        session.activeTenantId,
        session.tokenHash.value,
        session.createdAt,
        session.expiresAt,
        session.lastSeenAt,
        session.revokedAt,
      ],
    );
  }
}