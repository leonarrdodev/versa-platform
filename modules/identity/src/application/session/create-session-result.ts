export interface CreateSessionResult {
  readonly sessionId:
    string;

  readonly token:
    string;

  readonly userId:
    string;

  readonly activeTenantId:
    string | null;

  readonly expiresAt:
    string;
}