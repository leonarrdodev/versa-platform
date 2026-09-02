import type {
  Category,
  CategoryList,
} from '../types/category';

interface ApiErrorResponse {
  readonly code?:
    string;

  readonly message?:
    string;
}

export interface CreateCategoryInput {
  readonly name:
    string;
}

export interface CreateCategoryResult {
  readonly id:
    string;

  readonly tenantId:
    string;

  readonly name:
    string;

  readonly status:
    'active';

  readonly createdAt:
    string;

  readonly updatedAt:
    string;
}

export class CategoriesApiError
extends Error {
  public readonly code:
    string | null;

  public readonly status:
    number;

  constructor(
    message:
      string,

    code:
      string | null,

    status:
      number,
  ) {
    super(
      message,
    );

    this.name =
      'CategoriesApiError';

    this.code =
      code;

    this.status =
      status;
  }
}

async function readApiError(
  response:
    Response,
): Promise<
  CategoriesApiError
> {
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
    /*
     * Mantemos a mensagem segura
     * quando a API não responder JSON.
     */
  }

  return new CategoriesApiError(
    message,
    code,
    response.status,
  );
}

export async function getCategories():
Promise<CategoryList> {
  const response =
    await fetch(
      '/api/categories',
      {
        credentials:
          'include',
      },
    );

  if (
    !response.ok
  ) {
    throw await readApiError(
      response,
    );
  }

  return response.json() as
    Promise<CategoryList>;
}

export async function createCategory(
  input:
    CreateCategoryInput,
): Promise<
  CreateCategoryResult
> {
  const response =
    await fetch(
      '/api/categories',
      {
        method:
          'POST',

        credentials:
          'include',

        headers: {
          'content-type':
            'application/json',
        },

        body:
          JSON.stringify(
            input,
          ),
      },
    );

  if (
    !response.ok
  ) {
    throw await readApiError(
      response,
    );
  }

  return response.json() as
    Promise<CreateCategoryResult>;
}

export function categoryExists(
  categories:
    readonly Category[],

  categoryId:
    string,
): boolean {
  return categories.some(
    (
      category,
    ) =>
      category.id ===
      categoryId,
  );
}