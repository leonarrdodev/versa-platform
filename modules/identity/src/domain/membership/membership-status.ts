export const MEMBERSHIP_STATUSES = [
  'active',
  'suspended',
] as const;

export type MembershipStatus =
  typeof MEMBERSHIP_STATUSES[number];

export const INITIAL_MEMBERSHIP_STATUS:
  MembershipStatus = 'active';

export function isMembershipStatus(
  value: string,
): value is MembershipStatus {
  return MEMBERSHIP_STATUSES.some(
    (status) => status === value,
  );
}