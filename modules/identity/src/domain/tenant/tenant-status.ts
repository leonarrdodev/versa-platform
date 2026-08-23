export const TENANT_STATUSES = [
  'active',
  'suspended',
  'archived',
] as const;

export type TenantStatus =
  typeof TENANT_STATUSES[number];

export const INITIAL_TENANT_STATUS:
  TenantStatus = 'active';

export function isTenantStatus(
  value: string,
): value is TenantStatus {
  return TENANT_STATUSES.some(
    (status) => status === value,
  );
}