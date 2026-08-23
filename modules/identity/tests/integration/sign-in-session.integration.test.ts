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
  LoginHandler,
  PostgresAuthenticationRepository,
  PostgresIdentityUnitOfWork,
  PostgresSessionRepository,
  RegisterOwnerHandler,
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
  /*
   * sessions, credentials e memberships
   * possuem vínculo com o usuário.
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

describe(
  'Sign in session integration',
  () => {
    it(
      'authenticates and persists only the hash of the session token',
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
          `session.${uniqueValue}@example.com`;

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

        const login =
          new LoginHandler({
            authenticationRepository:
              new PostgresAuthenticationRepository(
                pool,
              ),

            passwordHasher,
          });

        const createSession =
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
          });

        const signIn =
          new SignInHandler({
            loginHandler:
              login,

            createSessionHandler:
              createSession,
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
                'Session Integration',

              tenantName:
                `Session Tenant ${uniqueValue}`,

              password,
            });

          userId =
            registration.userId;

          tenantId =
            registration.tenantId;

          const result =
            await signIn.execute({
              email,
              password,
            });

          expect(
            result.session
              .activeTenantId,
          ).toBe(
            tenantId,
          );

          expect(
            result.session.token
              .startsWith(
                'v1.',
              ),
          ).toBe(true);

          const persisted =
            await pool.query<{
              id: string;

              userId: string;

              activeTenantId:
                string | null;

              tokenHash: string;

              expiresAt: Date;

              revokedAt:
                Date | null;
            }>(
              `
                SELECT
                  id,

                  user_id
                    AS "userId",

                  active_tenant_id
                    AS "activeTenantId",

                  token_hash
                    AS "tokenHash",

                  expires_at
                    AS "expiresAt",

                  revoked_at
                    AS "revokedAt"

                FROM sessions

                WHERE id = $1
              `,
              [
                result.session.id,
              ],
            );

          const row =
            persisted.rows[0];

          expect(
            row,
          ).toBeDefined();

          if (
            row === undefined
          ) {
            throw new Error(
              'Expected persisted session',
            );
          }

          expect(
            row.userId,
          ).toBe(
            userId,
          );

          expect(
            row.activeTenantId,
          ).toBe(
            tenantId,
          );

          expect(
            row.revokedAt,
          ).toBeNull();

          /*
           * O token cru jamais deve
           * ser o valor persistido.
           */
          expect(
            row.tokenHash,
          ).not.toBe(
            result.session.token,
          );

          expect(
            row.tokenHash,
          ).toBe(
            tokenHasher.hash(
              result.session.token,
            ).value,
          );

          expect(
            row.tokenHash
              .startsWith(
                'sha256:',
              ),
          ).toBe(true);
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