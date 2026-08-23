export interface RegisterOwnerCommand {
  readonly email: string;
  readonly displayName: string;
  readonly tenantName: string;
  readonly password: string;
}