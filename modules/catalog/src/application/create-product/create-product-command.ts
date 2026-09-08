export interface CreateProductCommand {
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
}