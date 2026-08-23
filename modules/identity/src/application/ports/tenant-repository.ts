import type {
  Tenant,
} from '../../domain/tenant/tenant.js';

export interface TenantRepository {
  insert(
    tenant: Tenant,
  ): Promise<void>;
}