import type {
  PoolClient,
} from 'pg';

import type {
  UserRepository,
} from '../../application/ports/user-repository.js';

import type {
  User,
} from '../../domain/user/user.js';

import {
  UserEmailAlreadyExistsError,
} from '../../domain/user/user-email-already-exists-error.js';

const USER_NORMALIZED_EMAIL_UNIQUE_CONSTRAINT =
  'users_normalized_email_unique';

function isNormalizedEmailUniqueViolation(
  error: unknown,
): boolean {
  if (
    typeof error !== 'object'
    || error === null
  ) {
    return false;
  }

  const candidate =
    error as {
      code?: unknown;
      constraint?: unknown;
    };

  return (
    candidate.code === '23505'
    && candidate.constraint ===
      USER_NORMALIZED_EMAIL_UNIQUE_CONSTRAINT
  );
}

export class PostgresUserRepository
implements UserRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    user: User,
  ): Promise<void> {
    try {
      await this.client.query(
        `
          INSERT INTO users (
            id,
            email,
            normalized_email,
            display_name,
            status,
            created_at,
            updated_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7
          )
        `,
        [
          user.id,
          user.email.value,
          user.email.normalizedValue,
          user.displayName.value,
          user.status,
          user.createdAt,
          user.updatedAt,
        ],
      );
    } catch (error) {
      if (
        isNormalizedEmailUniqueViolation(
          error,
        )
      ) {
        throw new UserEmailAlreadyExistsError();
      }

      throw error;
    }
  }
}