import type {
  Product,
  ProductPage,
} from '../types/product';

const tenantId =
  import.meta.env.VITE_TENANT_ID;

if (
  typeof tenantId !== 'string' ||
  tenantId.trim() === ''
) {
  throw new Error(
    'VITE_TENANT_ID não configurado',
  );
}

interface ApiErrorResponse {
  readonly code?:
    string;

  readonly message?:
    string;
}

export interface CreateProductInput {
  readonly sku:
    string;

  readonly name:
    string;

  readonly categoryId:
    string;
}

export interface CreateProductResult {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly sku:
    string;

  readonly status:
    string;
}

export class ProductsApiError
extends Error {
  public readonly code:
    string | null;

  public readonly status:
    number;

  constructor(
    message: string,
    code: string | null,
    status: number,
  ) {
    super(message);

    this.name =
      'ProductsApiError';

    this.code =
      code;

    this.status =
      status;
  }
}

async function readApiError(
  response: Response,
): Promise<ProductsApiError> {
  let code:
    string | null =
    null;

  let message =
    'Ocorreu um erro inesperado.';

  try {
    const body =
      await response.json() as
        ApiErrorResponse;

    if (
      typeof body.code ===
      'string'
    ) {
      code =
        body.code;
    }

    if (
      typeof body.message ===
      'string'
    ) {
      message =
        body.message;
    }
  } catch {
    // Mantém a mensagem genérica.
  }

  return new ProductsApiError(
    message,
    code,
    response.status,
  );
}

export async function getProducts():
Promise<ProductPage> {
  const response =
    await fetch(
      '/api/products?limit=20&offset=0',
      {
        headers: {
          'x-tenant-id':
            tenantId,
        },
      },
    );

  if (!response.ok) {
    throw await readApiError(
      response,
    );
  }

  return response.json() as
    Promise<ProductPage>;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<CreateProductResult> {
  const response =
    await fetch(
      '/api/products',
      {
        method:
          'POST',

        headers: {
          'content-type':
            'application/json',

          'x-tenant-id':
            tenantId,
        },

        body:
          JSON.stringify(
            input,
          ),
      },
    );

  if (!response.ok) {
    throw await readApiError(
      response,
    );
  }

  return response.json() as
    Promise<CreateProductResult>;
}

export async function waitForProductProjection(
  productId: string,
  options: {
    readonly attempts?:
      number;

    readonly delayMs?:
      number;
  } = {},
): Promise<Product | null> {
  const attempts =
    options.attempts ??
    10;

  const delayMs =
    options.delayMs ??
    350;

  for (
    let attempt = 0;
    attempt < attempts;
    attempt += 1
  ) {
    const response =
      await fetch(
        `/api/products/${productId}`,
        {
          headers: {
            'x-tenant-id':
              tenantId,
          },
        },
      );

    if (response.ok) {
      return response.json() as
        Promise<Product>;
    }

    /*
     * Durante consistência eventual,
     * 404 significa simplesmente que
     * o worker ainda não projetou.
     */
    if (
      response.status !== 404
    ) {
      throw await readApiError(
        response,
      );
    }

    await new Promise<void>(
      (resolve) => {
        window.setTimeout(
          resolve,
          delayMs,
        );
      },
    );
  }

  return null;
}