import type {
  MembershipRole,
} from '../../domain/membership/membership-role.js';

export interface LoginMembershipResult {
  readonly tenantId: string;

  readonly role:
    MembershipRole;
}

export interface LoginResult {
  readonly userId: string;

  readonly email: string;

  readonly displayName: string;

  readonly memberships:
    readonly LoginMembershipResult[];
}