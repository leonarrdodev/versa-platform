import * as argon2 from 'argon2';

import type {
  PasswordHasher,
} from '../../application/ports/password-hasher.js';

export class Argon2PasswordHasher
implements PasswordHasher {
  async hash(
    plainPassword: string,
  ): Promise<string> {
    return argon2.hash(
      plainPassword,
      {
        type:
          argon2.argon2id,
      },
    );
  }

  async verify(
    plainPassword: string,
    passwordHash: string,
  ): Promise<boolean> {
    return argon2.verify(
      passwordHash,
      plainPassword,
    );
  }
}