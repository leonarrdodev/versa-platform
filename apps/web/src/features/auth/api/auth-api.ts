import type {
  AuthSession,
  LoginInput,
} from '../types/auth';

interface ApiErrorResponse {
  readonly code?:
    string;

  readonly message?:
    string;
}

export class AuthApiError
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
      'AuthApiError';

    this.code =
      code;

    this.status =
      status;
  }
}

async function readApiError(
  response:
    Response,
): Promise<AuthApiError> {
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
     * Mantém a mensagem genérica
     * quando a API não responde JSON.
     */
  }

  return new AuthApiError(
    message,
    code,
    response.status,
  );
}

export async function login(
  input:
    LoginInput,
): Promise<void> {
  const response =
    await fetch(
      '/api/auth/login',
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

  /*
   * Não precisamos guardar o
   * resultado do login.
   *
   * A fonte da verdade para o React
   * será GET /auth/session.
   */
}

export async function getSession():
Promise<AuthSession> {
  const response =
    await fetch(
      '/api/auth/session',
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
    Promise<AuthSession>;
}

export async function logout():
Promise<void> {
  const response =
    await fetch(
      '/api/auth/logout',
      {
        method:
          'POST',

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
}