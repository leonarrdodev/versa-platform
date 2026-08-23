import type {
  Pool,
} from 'pg';

import type {
  IdentityTransaction,
  IdentityUnitOfWork,
} from '../../application/ports/identity-unit-of-work.js';

import {
  PostgresTenantMembershipRepository,
} from './postgres-tenant-membership-repository.js';

import {
  PostgresTenantRepository,
} from './postgres-tenant-repository.js';

import {
  PostgresUserRepository,
} from './postgres-user-repository.js';

import {
  PostgresPasswordCredentialRepository,
} from './postgres-password-credential-repository.js';

export class PostgresIdentityUnitOfWork
implements IdentityUnitOfWork {
  constructor(
    private readonly pool: Pool,
  ) {}

  async execute<T>(
    work: (
      transaction:
        IdentityTransaction,
    ) => Promise<T>,
  ): Promise<T> {
    const client =
      await this.pool.connect();

    let transactionStarted = false;

    try {
      await client.query('BEGIN');

      transactionStarted = true;

      const transaction:
        IdentityTransaction = {
          users:
            new PostgresUserRepository(
              client,
            ),

          tenants:
            new PostgresTenantRepository(
              client,
            ),

          memberships:
            new PostgresTenantMembershipRepository(
              client,
            ),
          credentials:
            new PostgresPasswordCredentialRepository(
              client,
            ),
        };

      const result =
        await work(transaction);

      await client.query('COMMIT');

      transactionStarted = false;

      return result;
    } catch (error) {
      if (transactionStarted) {
        await client.query(
          'ROLLBACK',
        );
      }

      throw error;
    } finally {
      client.release();
    }
  }
}