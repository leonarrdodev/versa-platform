export const CATEGORY_STATUSES = [
  'active',
  'archived',
] as const;

export type CategoryStatus =
  typeof CATEGORY_STATUSES[number];

export const INITIAL_CATEGORY_STATUS =
  'active' as const satisfies CategoryStatus;

export function isCategoryStatus(
  value: string,
): value is CategoryStatus {
  return CATEGORY_STATUSES.some(
    (status) => status === value,
  );
}