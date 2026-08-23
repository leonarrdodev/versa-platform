import {
  parseUuid,
  type Uuid,
} from '@versa/shared-kernel';

declare const sessionIdBrand:
  unique symbol;

export type SessionId =
  Uuid & {
    readonly [sessionIdBrand]:
      true;
  };

export function parseSessionId(
  value: string,
): SessionId {
  return parseUuid(
    value,
  ) as SessionId;
}