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
    'owner'
    | 'admin'
    | 'member';
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