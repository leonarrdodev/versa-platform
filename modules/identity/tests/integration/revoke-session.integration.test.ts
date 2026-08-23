import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import {
  RandomUuidGenerator,
  SystemClock,
} from '@versa/shared-kernel';

import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

import {
  Argon2PasswordHasher,
  CreateSessionHandler,
  CryptoSessionTokenGenerator,
  InvalidSessionError,
  LoginHandler,
  PostgresAuthenticationRepository,
  PostgresIdentityUnitOfWork,
  PostgresSessionAuthenticationRepository,
  PostgresSessionRepository,
  PostgresSessionRevocationRepository,
  RegisterOwnerHandler,
  ResolveSessionHandler,
  RevokeSessionHandler,
  Sha256SessionTokenHasher,
  SignInHandler,
} from '../../src/index.js';

import {
  databaseTestConfig,
} from './database-test-config.js';

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

beforeAll(
  () => {
    pool =
      createDatabasePool(
        databaseTestConfig,
      );
  },
);

afterAll(
  async () => {
    await pool.end();
  },
);

async function cleanup(
  userId: string,
  tenantId: string,
): Promise<void> {
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

describe(
  'Revoke session integration',
  () => {
    it(
      'makes a real signed-in session unusable after revocation',
      async () => {
        const clock =
          new SystemClock();

        const idGenerator =
          new RandomUuidGenerator();

        const passwordHasher =
          new Argon2PasswordHasher();

        const tokenHasher =
          new Sha256SessionTokenHasher();

        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `logout.${uniqueValue}@example.com`;

        const password =
          'uma senha longa e segura';

        const register =
          new RegisterOwnerHandler({
            clock,
            idGenerator,
            passwordHasher,

            unitOfWork:
              new PostgresIdentityUnitOfWork(
                pool,
              ),
          });

        const signIn =
          new SignInHandler({
            loginHandler:
              new LoginHandler({
                authenticationRepository:
                  new PostgresAuthenticationRepository(
                    pool,
                  ),

                passwordHasher,
              }),

            createSessionHandler:
              new CreateSessionHandler({
                clock,
                idGenerator,

                tokenGenerator:
                  new CryptoSessionTokenGenerator(),

                tokenHasher,

                sessionRepository:
                  new PostgresSessionRepository(
                    pool,
                  ),

                sessionDurationMs:
                  7
                  * 24
                  * 60
                  * 60
                  * 1000,
              }),
          });

        const resolveSession =
          new ResolveSessionHandler({
            clock,
            tokenHasher,

            authenticationRepository:
              new PostgresSessionAuthenticationRepository(
                pool,
              ),
          });

        const revokeSession =
          new RevokeSessionHandler({
            clock,
            tokenHasher,

            revocationRepository:
              new PostgresSessionRevocationRepository(
                pool,
              ),
          });

        let userId:
          string | null = null;

        let tenantId:
          string | null = null;

        try {
          const registration =
            await register.execute({
              email,

              displayName:
                'Logout Integration',

              tenantName:
                `Logout Tenant ${uniqueValue}`,

              password,
            });

          userId =
            registration.userId;

          tenantId =
            registration.tenantId;

          const signedIn =
            await signIn.execute({
              email,
              password,
            });

          /*
           * Antes do logout:
           * token válido.
           */
          await expect(
            resolveSession.execute(
              signedIn
                .session
                .token,
            ),
          ).resolves.toBeDefined();

          await revokeSession.execute(
            signedIn
              .session
              .token,
          );

          /*
           * Depois do logout:
           * exatamente o mesmo token
           * não pode mais autenticar.
           */
          await expect(
            resolveSession.execute(
              signedIn
                .session
                .token,
            ),
          ).rejects.toBeInstanceOf(
            InvalidSessionError,
          );

          const persisted =
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
                signedIn
                  .session
                  .id,
              ],
            );

          expect(
            persisted
              .rows[0]
              ?.revokedAt,
          ).toBeInstanceOf(
            Date,
          );
        } finally {
          if (
            userId !== null
            && tenantId !== null
          ) {
            await cleanup(
              userId,
              tenantId,
            );
          }
        }
      },
    );
  },
);