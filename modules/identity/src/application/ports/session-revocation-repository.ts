import type {
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

export interface SessionRevocationRepository {
  revokeByTokenHash(
    tokenHash: SessionTokenHash,
    revokedAt: Date,
  ): Promise<void>;
}