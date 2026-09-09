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
    string | null;

  readonly description?:
    string | null;

  /*
   * Valores monetários são recebidos
   * em centavos.
   *
   * Exemplo:
   *
   * R$ 34,90 -> 3490
   */
  readonly costPriceInCents?:
    number | null;

  readonly salePriceInCents?:
    number | null;
}