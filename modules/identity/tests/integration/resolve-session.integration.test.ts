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
  RegisterOwnerHandler,
  ResolveSessionHandler,
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
  'Resolve session integration',
  () => {
    it(
      'resolves the session created by a real sign in',
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
          `resolve.${uniqueValue}@example.com`;

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

        let userId:
          string | null = null;

        let tenantId:
          string | null = null;

        try {
          const registration =
            await register.execute({
              email,

              displayName:
                'Resolve Session Integration',

              tenantName:
                `Resolve Tenant ${uniqueValue}`,

              password,
            });

          userId =
            registration.userId;

          tenantId =
            registration.tenantId;

          const signInResult =
            await signIn.execute({
              email,
              password,
            });

          const resolved =
            await resolveSession.execute(
              signInResult
                .session
                .token,
            );

          expect(
            resolved.sessionId,
          ).toBe(
            signInResult
              .session
              .id,
          );

          expect(
            resolved.user,
          ).toEqual({
            id:
              userId,

            email,

            displayName:
              'Resolve Session Integration',
          });

          expect(
            resolved.activeTenant,
          ).toEqual({
            id:
              tenantId,

            role:
              'owner',
          });
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

    it(
      'rejects a tampered session token',
      async () => {
        const resolveSession =
          new ResolveSessionHandler({
            clock:
              new SystemClock(),

            tokenHasher:
              new Sha256SessionTokenHasher(),

            authenticationRepository:
              new PostgresSessionAuthenticationRepository(
                pool,
              ),
          });

        await expect(
          resolveSession.execute(
            `v1.${randomUUID()}-tampered`,
          ),
        ).rejects.toBeInstanceOf(
          InvalidSessionError,
        );
      },
    );
  },
);