import {
  parseUuid,
  type Uuid,
} from '@versa/shared-kernel';

declare const userIdBrand: unique symbol;

export type UserId = Uuid & {
  readonly [userIdBrand]: true;
};

export function parseUserId(
  value: string,
): UserId {
  return parseUuid(value) as UserId;
}