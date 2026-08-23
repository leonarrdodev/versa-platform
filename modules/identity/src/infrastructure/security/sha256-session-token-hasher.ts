import {
  createHash,
} from 'node:crypto';

import type {
  SessionTokenHasher,
} from '../../application/ports/session-token-hasher.js';

import {
  SessionTokenHash,
} from '../../domain/session/session-token-hash.js';

export class Sha256SessionTokenHasher
implements SessionTokenHasher {
  hash(
    rawToken: string,
  ): SessionTokenHash {
    const digest =
      createHash('sha256')
        .update(
          rawToken,
          'utf8',
        )
        .digest(
          'hex',
        );

    return SessionTokenHash.create(
      `sha256:${digest}`,
    );
  }
}