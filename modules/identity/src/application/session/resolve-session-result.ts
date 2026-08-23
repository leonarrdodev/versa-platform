import type {
  MembershipRole,
} from '../../domain/membership/membership-role.js';

export interface ResolveSessionResult {
  readonly sessionId:
    string;

  readonly user: {
    readonly id:
      string;

    readonly email:
      string;

    readonly displayName:
      string;
  };

  readonly activeTenant:
    | {
        readonly id:
          string;

        readonly role:
          MembershipRole;
      }
    | null;

  readonly expiresAt:
    string;
}