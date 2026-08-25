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
  Sha256SessionTokenHasher,
} from '@versa/identity';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import type {
  FastifyInstance,
} from 'fastify';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  buildApp,
} from '../../src/app.js';

import {
  createIdentityComposition,
} from '../../src/composition/identity.js';

import {
  env,
} from '../../src/config/env.js';

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

let app:
  FastifyInstance;

const clock =
  new SystemClock();

const idGenerator =
  new RandomUuidGenerator();

const passwordHasher =
  new Argon2PasswordHasher();

const tokenHasher =
  new Sha256SessionTokenHasher();

function getSetCookieHeader(
  value:
    string
    | string[]
    | undefined,
): string {
  if (
    value === undefined
  ) {
    throw new Error(
      'Expected Set-Cookie header',
    );
  }

  return Array.isArray(value)
    ? value.join('; ')
    : value;
}

function extractSessionToken(
  setCookie:
    string,
): string {
  const firstPart =
    setCookie
      .split(';')[0];

  const prefix =
    'versa_session=';

  if (
    firstPart === undefined
    || !firstPart.startsWith(
      prefix,
    )
  ) {
    throw new Error(
      'Expected versa_session cookie',
    );
  }

  const token =
    firstPart.slice(
      prefix.length,
    );

  if (
    token.length === 0
  ) {
    throw new Error(
      'Expected non-empty session token',
    );
  }

  return token;
}

async function cleanupIdentity(
  userId:
    string,

  tenantId:
    string,
): Promise<void> {
  /*
   * Apagar o usuário remove por
   * cascade:
   *
   * - password_credentials
   * - tenant_memberships
   * - sessions
   */
  await pool.query(
    `
      DELETE FROM users
      WHERE id = $1
    `,
    [
      userId,
    ],
  );

  await pool.query(
    `
      DELETE FROM tenants
      WHERE id = $1
    `,
    [
      tenantId,
    ],
  );
}

beforeAll(
  async () => {
    pool =
      createDatabasePool(
        env.database,
      );

    const identity =
      createIdentityComposition(
        pool,
      );

    app =
      buildApp({
        logger:
          false,

        identity: {
          signInHandler:
            identity.signInHandler,

          resolveSessionHandler:
            identity.resolveSessionHandler,

          revokeSessionHandler:
            identity.revokeSessionHandler,

          /*
           * app.inject() não usa HTTPS.
           */
          secureCookies:
            false,
        },
      });

    await app.ready();
  },
);

afterAll(
  async () => {
    await app.close();

    await pool.end();
  },
);

describe(
  'Authentication HTTP session lifecycle',
  () => {
    it(
      'logs in, resolves the session, logs out and rejects the revoked token',
      async () => {
        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `auth.e2e.${uniqueValue}@example.com`;

        const password =
          'uma senha longa e segura';

        const displayName =
          'Auth HTTP E2E';

        const tenantName =
          `Auth Tenant ${uniqueValue}`;

        const registerOwner =
          new RegisterOwnerHandler({
            clock,

            idGenerator,

            passwordHasher,

            unitOfWork:
              new PostgresIdentityUnitOfWork(
                pool,
              ),
          });

        let userId:
          string | null =
            null;

        let tenantId:
          string | null =
            null;

        try {
          /*
           * 1. Cria uma identidade
           * real no PostgreSQL.
           */
          const registration =
            await registerOwner
              .execute({
                email,

                displayName,

                tenantName,

                password,
              });

          userId =
            registration.userId;

          tenantId =
            registration.tenantId;

          /*
           * 2. Login via HTTP.
           */
          const loginResponse =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/login',

              payload: {
                email,
                password,
              },
            });

          expect(
            loginResponse
              .statusCode,
          ).toBe(200);

          const loginBody =
            loginResponse.json<{
              user: {
                id:
                  string;

                email:
                  string;

                displayName:
                  string;
              };

              memberships:
                Array<{
                  tenantId:
                    string;

                  role:
                    string;
                }>;

              session: {
                id:
                  string;

                activeTenantId:
                  string | null;

                expiresAt:
                  string;
              };
            }>();

          expect(
            loginBody.user,
          ).toEqual({
            id:
              userId,

            email,

            displayName,
          });

          expect(
            loginBody.memberships,
          ).toEqual([
            {
              tenantId,

              role:
                'owner',
            },
          ]);

          expect(
            loginBody.session
              .activeTenantId,
          ).toBe(
            tenantId,
          );

          /*
           * 3. Confirma o cookie.
           */
          const setCookie =
            getSetCookieHeader(
              loginResponse
                .headers[
                  'set-cookie'
                ],
            );

          expect(
            setCookie,
          ).toContain(
            'versa_session=',
          );

          expect(
            setCookie,
          ).toContain(
            'HttpOnly',
          );

          expect(
            setCookie,
          ).toContain(
            'SameSite=Lax',
          );

          expect(
            setCookie,
          ).toContain(
            'Path=/',
          );

          const rawToken =
            extractSessionToken(
              setCookie,
            );

          expect(
            rawToken.startsWith(
              'v1.',
            ),
          ).toBe(true);

          /*
           * O token secreto não pode
           * aparecer no JSON.
           */
          expect(
            loginResponse.body,
          ).not.toContain(
            rawToken,
          );

          /*
           * 4. Verifica diretamente
           * o que foi persistido.
           */
          const persistedSession =
            await pool.query<{
              id:
                string;

              tokenHash:
                string;

              revokedAt:
                Date | null;
            }>(
              `
                SELECT
                  id,

                  token_hash
                    AS "tokenHash",

                  revoked_at
                    AS "revokedAt"

                FROM sessions

                WHERE user_id = $1

                ORDER BY
                  created_at DESC

                LIMIT 1
              `,
              [
                userId,
              ],
            );

          const sessionRow =
            persistedSession
              .rows[0];

          expect(
            sessionRow,
          ).toBeDefined();

          if (
            sessionRow ===
            undefined
          ) {
            throw new Error(
              'Expected persisted session',
            );
          }

          expect(
            sessionRow.id,
          ).toBe(
            loginBody.session.id,
          );

          /*
           * O banco não pode conter
           * o token cru.
           */
          expect(
            sessionRow.tokenHash,
          ).not.toBe(
            rawToken,
          );

          expect(
            sessionRow.tokenHash,
          ).toBe(
            tokenHasher.hash(
              rawToken,
            ).value,
          );

          expect(
            sessionRow.tokenHash
              .startsWith(
                'sha256:',
              ),
          ).toBe(true);

          expect(
            sessionRow.revokedAt,
          ).toBeNull();

          /*
           * 5. Reutiliza o cookie
           * como um navegador faria.
           */
          const sessionResponse =
            await app.inject({
              method:
                'GET',

              url:
                '/auth/session',

              headers: {
                cookie:
                  `versa_session=${rawToken}`,
              },
            });

          expect(
            sessionResponse
              .statusCode,
          ).toBe(200);

          expect(
            sessionResponse
              .json(),
          ).toEqual({
            sessionId:
              loginBody.session.id,

            user: {
              id:
                userId,

              email,

              displayName,
            },

            activeTenant: {
              id:
                tenantId,

              role:
                'owner',
            },

            expiresAt:
              loginBody.session
                .expiresAt,
          });

          /*
           * 6. Logout pela API.
           */
          const logoutResponse =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/logout',

              headers: {
                cookie:
                  `versa_session=${rawToken}`,
              },
            });

          expect(
            logoutResponse
              .statusCode,
          ).toBe(204);

          const clearCookie =
            getSetCookieHeader(
              logoutResponse
                .headers[
                  'set-cookie'
                ],
            );

          expect(
            clearCookie,
          ).toContain(
            'versa_session=',
          );

          expect(
            clearCookie,
          ).toContain(
            'Path=/',
          );

          /*
           * 7. Confirma revogação
           * diretamente no banco.
           */
          const revokedSession =
            await pool.query<{
              revokedAt:
                Date | null;
            }>(
              `
                SELECT
                  revoked_at
                    AS "revokedAt"

                FROM sessions

                WHERE id = $1
              `,
              [
                loginBody
                  .session
                  .id,
              ],
            );

          expect(
            revokedSession
              .rows[0]
              ?.revokedAt,
          ).toBeInstanceOf(
            Date,
          );

          /*
           * 8. Mesmo que alguém ainda
           * possua o token antigo,
           * ele não pode mais entrar.
           */
          const afterLogout =
            await app.inject({
              method:
                'GET',

              url:
                '/auth/session',

              headers: {
                cookie:
                  `versa_session=${rawToken}`,
              },
            });

          expect(
            afterLogout
              .statusCode,
          ).toBe(401);

          expect(
            afterLogout
              .json(),
          ).toEqual({
            code:
              'INVALID_SESSION',

            message:
              'Sessão inválida ou expirada.',
          });
        } finally {
          if (
            userId !== null
            && tenantId !== null
          ) {
            await cleanupIdentity(
              userId,
              tenantId,
            );
          }
        }
      },
    );
  },
);