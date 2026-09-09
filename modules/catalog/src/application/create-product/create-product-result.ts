export interface CreateProductResult {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly sku:
    string;

  readonly name:
    string;

  readonly categoryId:
    string;

  readonly brand:
    string | null;

  readonly description:
    string | null;

  readonly costPriceInCents:
    number | null;

  readonly salePriceInCents:
    number | null;

  readonly status:
    string;

  readonly createdAt:
    string;

  readonly updatedAt:
    string;
}