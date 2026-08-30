export type TenantRole =
  'owner'
  | 'admin'
  | 'member';

export interface AuthenticatedUser {
  readonly id:
    string;

  readonly email:
    string;

  readonly displayName:
    string;
}

export interface ActiveTenant {
  readonly id:
    string;

  readonly name:
    string;

  readonly role:
    TenantRole;
}

export interface AvailableTenant {
  readonly id:
    string;

  readonly name:
    string;

  readonly role:
    TenantRole;
}

export interface AuthSession {
  readonly sessionId:
    string;

  readonly user:
    AuthenticatedUser;

  readonly activeTenant:
    ActiveTenant | null;

  readonly expiresAt:
    string;
}

export interface LoginInput {
  readonly email:
    string;

  readonly password:
    string;
}