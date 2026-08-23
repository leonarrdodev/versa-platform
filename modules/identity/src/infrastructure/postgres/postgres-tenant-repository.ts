import type {
  PoolClient,
} from 'pg';

import type {
  TenantRepository,
} from '../../application/ports/tenant-repository.js';

import type {
  Tenant,
} from '../../domain/tenant/tenant.js';

export class PostgresTenantRepository
implements TenantRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    tenant: Tenant,
  ): Promise<void> {
    await this.client.query(
      `
        INSERT INTO tenants (
          id,
          name,
          status,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )
      `,
      [
        tenant.id,
        tenant.name.value,
        tenant.status,
        tenant.createdAt,
        tenant.updatedAt,
      ],
    );
  }
}