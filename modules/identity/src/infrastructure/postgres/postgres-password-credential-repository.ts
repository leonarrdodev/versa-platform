import type {
  PoolClient,
} from 'pg';

import type {
  PasswordCredentialRepository,
} from '../../application/ports/password-credential-repository.js';

import type {
  PasswordCredential,
} from '../../domain/credential/password-credential.js';

export class PostgresPasswordCredentialRepository
implements PasswordCredentialRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    credential:
      PasswordCredential,
  ): Promise<void> {
    await this.client.query(
      `
        INSERT INTO password_credentials (
          user_id,
          password_hash,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4
        )
      `,
      [
        credential.userId,
        credential.passwordHash.value,
        credential.createdAt,
        credential.updatedAt,
      ],
    );
  }
}