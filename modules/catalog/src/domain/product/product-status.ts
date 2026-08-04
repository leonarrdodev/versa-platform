export const PRODUCT_STATUSES = [
  'draft',
  'active',
  'inactive',
  'archived',
] as const;

export type ProductStatus =
  typeof PRODUCT_STATUSES[number];

export const INITIAL_PRODUCT_STATUS: ProductStatus =
  'draft';

export function isProductStatus(
  value: string,
): value is ProductStatus {
  return PRODUCT_STATUSES.some(
    (status) => status === value,
  );
}