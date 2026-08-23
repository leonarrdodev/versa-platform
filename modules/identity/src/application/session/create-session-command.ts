export interface CreateSessionCommand {
  readonly userId: string;

  readonly activeTenantId:
    string | null;
}