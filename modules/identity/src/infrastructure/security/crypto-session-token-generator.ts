import {
  randomBytes,
} from 'node:crypto';

import type {
  SessionTokenGenerator,
} from '../../application/ports/session-token-generator.js';

const SESSION_TOKEN_BYTES = 32;

export class CryptoSessionTokenGenerator
implements SessionTokenGenerator {
  generate(): string {
    const secret =
      randomBytes(
        SESSION_TOKEN_BYTES,
      ).toString(
        'base64url',
      );

    return `v1.${secret}`;
  }
}