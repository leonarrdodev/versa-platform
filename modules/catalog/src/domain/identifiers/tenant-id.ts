import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Uuid,
} from '@versa/shared-kernel';

declare const tenantIdBrand: unique symbol;

export type TenantId = Uuid & {
  readonly [tenantIdBrand]: true;
};

export function parseTenantId(value: string): TenantId {
  return parseUuid(value) as TenantId;
}

export function tenantIdFromUuid(value: Uuid): TenantId {
  return value as TenantId;
}