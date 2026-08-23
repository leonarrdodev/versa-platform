import type {
  MembershipRole,
} from '../../domain/membership/membership-role.js';

export interface SignInMembershipResult {
  readonly tenantId: string;
  readonly role: MembershipRole;
}

export interface SignInResult {
  readonly userId: string;
  readonly email: string;
  readonly displayName: string;

  readonly memberships:
    readonly SignInMembershipResult[];

  readonly session: {
    readonly id: string;
    readonly token: string;

    readonly activeTenantId:
      string | null;

    readonly expiresAt: string;
  };
}