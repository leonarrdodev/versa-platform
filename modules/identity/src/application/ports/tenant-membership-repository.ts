import type {
  TenantMembership,
} from '../../domain/membership/tenant-membership.js';

export interface TenantMembershipRepository {
  insert(
    membership: TenantMembership,
  ): Promise<void>;
}