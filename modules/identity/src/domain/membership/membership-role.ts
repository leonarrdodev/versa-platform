export const MEMBERSHIP_ROLES = [
  'owner',
  'admin',
  'member',
] as const;

export type MembershipRole =
  typeof MEMBERSHIP_ROLES[number];

export function isMembershipRole(
  value: string,
): value is MembershipRole {
  return MEMBERSHIP_ROLES.some(
    (role) => role === value,
  );
}