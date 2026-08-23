import type {
  PoolClient,
} from 'pg';

import type {
  TenantMembershipRepository,
} from '../../application/ports/tenant-membership-repository.js';

import type {
  TenantMembership,
} from '../../domain/membership/tenant-membership.js';

export class PostgresTenantMembershipRepository
implements TenantMembershipRepository {
  constructor(
    private readonly client:
      PoolClient,
  ) {}

  async insert(
    membership:
      TenantMembership,
  ): Promise<void> {
    await this.client.query(
      `
        INSERT INTO tenant_memberships (
          user_id,
          tenant_id,
          role,
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
          $6
        )
      `,
      [
        membership.userId,
        membership.tenantId,
        membership.role,
        membership.status,
        membership.createdAt,
        membership.updatedAt,
      ],
    );
  }
}