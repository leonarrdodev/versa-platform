import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Uuid,
} from '@versa/shared-kernel';

declare const categoryIdBrand: unique symbol;

export type CategoryId = Uuid & {
  readonly [categoryIdBrand]: true;
};

export function parseCategoryId(value: string): CategoryId {
  return parseUuid(value) as CategoryId;
}

export function categoryIdFromUuid(value: Uuid): CategoryId {
  return value as CategoryId;
}