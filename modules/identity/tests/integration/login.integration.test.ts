import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import {
  parseUuid,
  SystemClock,
} from '@versa/shared-kernel';

import type {
  IdGenerator,
  Uuid,
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
  InvalidCredentialsError,
  LoginHandler,
  PostgresAuthenticationRepository,
  PostgresIdentityUnitOfWork,
  RegisterOwnerHandler,
} from '../../src/index.js';

import {
  databaseTestConfig,
} from './database-test-config.js';

class SequenceIdGenerator
implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values:
      readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[
        this.currentIndex
      ];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

const passwordHasher =
  new Argon2PasswordHasher();

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

async function cleanupIdentity(
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
  'Login integration',
  () => {
    it(
      'authenticates a registered owner using PostgreSQL and Argon2id',
      async () => {
        const userId =
          parseUuid(
            randomUUID(),
          );

        const tenantId =
          parseUuid(
            randomUUID(),
          );

        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `login.${uniqueValue}@example.com`;

        const password =
          'uma senha longa e segura';

        const registerHandler =
          new RegisterOwnerHandler({
            clock:
              new SystemClock(),

            idGenerator:
              new SequenceIdGenerator([
                userId,
                tenantId,
              ]),

            passwordHasher,

            unitOfWork:
              new PostgresIdentityUnitOfWork(
                pool,
              ),
          });

        const loginHandler =
          new LoginHandler({
            authenticationRepository:
              new PostgresAuthenticationRepository(
                pool,
              ),

            passwordHasher,
          });

        try {
          await registerHandler.execute({
            email,
            displayName:
              'Usuário Login Integration',

            tenantName:
              `Tenant Login ${uniqueValue}`,

            password,
          });

          const result =
            await loginHandler.execute({
              email:
                email.toUpperCase(),

              password,
            });

          expect(
            result.userId,
          ).toBe(
            userId,
          );

          expect(
            result.email,
          ).toBe(
            email,
          );

          expect(
            result.displayName,
          ).toBe(
            'Usuário Login Integration',
          );

          expect(
            result.memberships,
          ).toEqual([
            {
              tenantId,
              role:
                'owner',
            },
          ]);
        } finally {
          await cleanupIdentity(
            userId,
            tenantId,
          );
        }
      },
    );

    it(
      'rejects an incorrect password',
      async () => {
        const userId =
          parseUuid(
            randomUUID(),
          );

        const tenantId =
          parseUuid(
            randomUUID(),
          );

        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `wrong-password.${uniqueValue}@example.com`;

        const registerHandler =
          new RegisterOwnerHandler({
            clock:
              new SystemClock(),

            idGenerator:
              new SequenceIdGenerator([
                userId,
                tenantId,
              ]),

            passwordHasher,

            unitOfWork:
              new PostgresIdentityUnitOfWork(
                pool,
              ),
          });

        const loginHandler =
          new LoginHandler({
            authenticationRepository:
              new PostgresAuthenticationRepository(
                pool,
              ),

            passwordHasher,
          });

        try {
          await registerHandler.execute({
            email,

            displayName:
              'Wrong Password Integration',

            tenantName:
              `Tenant Wrong ${uniqueValue}`,

            password:
              'senha correta longa e segura',
          });

          await expect(
            loginHandler.execute({
              email,

              password:
                'senha incorreta completamente',
            }),
          ).rejects.toBeInstanceOf(
            InvalidCredentialsError,
          );
        } finally {
          await cleanupIdentity(
            userId,
            tenantId,
          );
        }
      },
    );

    it(
      'rejects an unknown email without revealing whether the user exists',
      async () => {
        const loginHandler =
          new LoginHandler({
            authenticationRepository:
              new PostgresAuthenticationRepository(
                pool,
              ),

            passwordHasher,
          });

        await expect(
          loginHandler.execute({
            email:
              `missing.${randomUUID()}@example.com`,

            password:
              'qualquer senha apresentada',
          }),
        ).rejects.toBeInstanceOf(
          InvalidCredentialsError,
        );
      },
    );
  },
);