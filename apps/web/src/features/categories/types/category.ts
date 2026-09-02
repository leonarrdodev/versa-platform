export interface Category {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly name:
    string;

  readonly status:
    'active' |
    'archived';

  readonly createdAt:
    string;

  readonly updatedAt:
    string;
}

export interface CategoryList {
  readonly items:
    readonly Category[];
}