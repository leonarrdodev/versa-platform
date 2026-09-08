export interface Product {
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

  readonly brand?:
    string;

  readonly description?:
    string;

  readonly status:
    'draft'
    | 'active'
    | 'inactive'
    | 'archived';

  readonly createdAt:
    string;

  readonly updatedAt:
    string;

  readonly projectedAt:
    string;
}

export interface ProductPage {
  readonly items:
    readonly Product[];

  readonly hasMore:
    boolean;

  readonly nextOffset:
    number | null;
}