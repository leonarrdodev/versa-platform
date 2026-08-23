import type {
  SessionAuthentication,
} from '../session/session-authentication.js';

import type {
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

export interface SessionAuthenticationRepository {
  findByTokenHash(
    tokenHash: SessionTokenHash,
  ): Promise<
    SessionAuthentication | null
  >;
}