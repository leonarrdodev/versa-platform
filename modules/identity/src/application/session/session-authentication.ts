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

export interface SessionAuthentication {
  readonly sessionId:
    string;

  readonly userId:
    string;

  readonly email:
    string;

  readonly displayName:
    string;

  readonly userStatus:
    UserStatus;

  readonly activeTenantId:
    string | null;

  readonly tenantName:
    string | null;

  readonly tenantStatus:
    TenantStatus | null;

  readonly membershipRole:
    MembershipRole | null;

  readonly membershipStatus:
    MembershipStatus | null;

  readonly createdAt:
    Date;

  readonly expiresAt:
    Date;

  readonly lastSeenAt:
    Date;

  readonly revokedAt:
    Date | null;
}