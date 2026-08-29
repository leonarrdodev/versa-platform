import type {
  AvailableTenant,
} from '../tenant-selection/available-tenant.js';

export interface SetActiveTenantInput {
  readonly sessionId:
    string;

  readonly userId:
    string;

  readonly tenantId:
    string;
}

export interface TenantSelectionRepository {
  listAvailableTenants(
    userId:
      string,
  ): Promise<
    readonly AvailableTenant[]
  >;

  setActiveTenant(
    input:
      SetActiveTenantInput,
  ): Promise<boolean>;
}