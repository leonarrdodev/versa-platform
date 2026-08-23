import type {
  MembershipRole,
} from '../../domain/membership/membership-role.js';

import type {
  MembershipStatus,
} from '../../domain/membership/membership-status.js';

import type {
  TenantStatus,
} from '../../domain/tenant/tenant-status.js';

import type {
  UserStatus,
} from '../../domain/user/user-status.js';

export interface RegisterOwnerResult {
  readonly userId: string;
  readonly tenantId: string;

  readonly email: string;
  readonly displayName: string;

  readonly tenantName: string;

  readonly userStatus: UserStatus;
  readonly tenantStatus: TenantStatus;

  readonly membershipRole:
    MembershipRole;

  readonly membershipStatus:
    MembershipStatus;

  readonly createdAt: string;
}