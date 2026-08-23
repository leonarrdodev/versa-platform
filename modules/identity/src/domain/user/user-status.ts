export const USER_STATUSES = [
  'active',
  'disabled',
] as const;

export type UserStatus =
  typeof USER_STATUSES[number];

export const INITIAL_USER_STATUS:
  UserStatus = 'active';

export function isUserStatus(
  value: string,
): value is UserStatus {
  return USER_STATUSES.some(
    (status) => status === value,
  );
}