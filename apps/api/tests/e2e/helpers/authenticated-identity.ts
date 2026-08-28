import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import {
  Argon2PasswordHasher,
  PostgresIdentityUnitOfWork,
  RegisterOwnerHandler,
} from '@versa/identity';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import type {
  FastifyInstance,
} from 'fastify';

type DatabasePool =
  ReturnType<
    typeof createDatabasePool
  >;

export interface AuthenticatedIdentity {
  readonly userId:
    string;

  readonly tenantId:
    string;

  readonly email:
    string;

  readonly cookie:
    string;
}

interface CreateAuthenticatedIdentityInput {
  readonly app:
    FastifyInstance;

  readonly pool:
    DatabasePool;

  readonly prefix:
    string;
}

function extractSessionCookie(
  setCookie:
    string
    | string[]
    | undefined,
): string {
  if (
    setCookie ===
    undefined
  ) {
    throw new Error(
      'Expected Set-Cookie header after login',
    );
  }

  const value =
    Array.isArray(
      setCookie,
    )
      ? setCookie[0]
      : setCookie;

  if (
    value ===
    undefined
  ) {
    throw new Error(
      'Expected session cookie',
    );
  }

  const cookie =
    value
      .split(';')[0];

  if (
    cookie ===
    undefined
    || !cookie.startsWith(
      'versa_session=',
    )
  ) {
    throw new Error(
      'Expected versa_session cookie',
    );
  }

  return cookie;
}

export async function createAuthenticatedIdentity(
  input:
    CreateAuthenticatedIdentityInput,
): Promise<
  AuthenticatedIdentity
> {
  const uniqueValue =
    randomUUID()
      .replaceAll(
        '-',
        '',
      );

  const email =
    `${input.prefix}.${uniqueValue}@example.com`;

  const password =
    'uma senha longa e segura';

  const registerOwner =
    new RegisterOwnerHandler({
      clock:
        new SystemClock(),

      idGenerator:
        new RandomUuidGenerator(),

      passwordHasher:
        new Argon2PasswordHasher(),

      unitOfWork:
        new PostgresIdentityUnitOfWork(
          input.pool,
        ),
    });

  const registration =
    await registerOwner.execute({
      email,

      displayName:
        `E2E ${input.prefix}`,

      tenantName:
        `Tenant ${input.prefix} ${uniqueValue}`,

      password,
    });

  const login =
    await input.app.inject({
      method:
        'POST',

      url:
        '/auth/login',

      payload: {
        email,
        password,
      },
    });

  if (
    login.statusCode !==
    200
  ) {
    throw new Error(
      `E2E login failed with status ${login.statusCode}: ${login.body}`,
    );
  }

  return {
    userId:
      registration.userId,

    tenantId:
      registration.tenantId,

    email,

    cookie:
      extractSessionCookie(
        login.headers[
          'set-cookie'
        ],
      ),
  };
}

export async function cleanupAuthenticatedIdentity(
  pool:
    DatabasePool,

  identity:
    AuthenticatedIdentity,
): Promise<void> {
  /*
   * Remove também session,
   * password_credentials e
   * tenant_memberships por cascade.
   */
  await pool.query(
    `
      DELETE FROM users
      WHERE id = $1
    `,
    [
      identity.userId,
    ],
  );

  await pool.query(
    `
      DELETE FROM tenants
      WHERE id = $1
    `,
    [
      identity.tenantId,
    ],
  );
}