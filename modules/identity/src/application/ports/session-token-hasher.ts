import type {
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

export interface SessionTokenHasher {
  hash(
    rawToken: string,
  ): SessionTokenHash;
}