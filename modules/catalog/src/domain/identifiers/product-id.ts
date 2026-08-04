import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Uuid,
} from '@versa/shared-kernel';

declare const productIdBrand: unique symbol;

export type ProductId = Uuid & {
  readonly [productIdBrand]: true;
};

export function parseProductId(value: string): ProductId {
  return parseUuid(value) as ProductId;
}

export function productIdFromUuid(value: Uuid): ProductId {
  return value as ProductId;
}