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

export interface AuthenticationMembership {
  readonly tenantId: string;

  readonly tenantStatus:
    TenantStatus;

  readonly role:
    MembershipRole;

  readonly status:
    MembershipStatus;
}

export interface AuthenticationIdentity {
  readonly userId: string;

  readonly email: string;
  readonly normalizedEmail: string;
  readonly displayName: string;

  readonly userStatus:
    UserStatus;

  readonly passwordHash:
    string;

  readonly memberships:
    readonly AuthenticationMembership[];
}