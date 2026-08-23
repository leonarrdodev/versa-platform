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
  PostgresIdentityUnitOfWork,
  RegisterOwnerHandler,
  UserEmailAlreadyExistsError,
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

function createHandler(
  userId: Uuid,
  tenantId: Uuid,
): RegisterOwnerHandler {
  return new RegisterOwnerHandler({
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
}

async function cleanupIdentity(
  userId: string,
  tenantId: string,
): Promise<void> {
  /*
   * A exclusão do usuário remove
   * password_credentials e
   * tenant_memberships por cascade.
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
  'RegisterOwner integration',
  () => {
    it(
      'persists owner registration with a real Argon2id credential',
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
          randomUUID();

        const email =
          `Integration.${uniqueValue}@Example.COM`;

        const password =
          'uma senha longa e segura';

        const handler =
          createHandler(
            userId,
            tenantId,
          );

        try {
          const result =
            await handler.execute({
              email,

              displayName:
                'Usuário Integration',

              tenantName:
                `Versa Integration ${uniqueValue}`,

              password,
            });

          expect(
            result.userId,
          ).toBe(
            userId,
          );

          expect(
            result.tenantId,
          ).toBe(
            tenantId,
          );

          const persisted =
            await pool.query<{
              email: string;

              normalizedEmail:
                string;

              displayName:
                string;

              userStatus:
                string;

              tenantName:
                string;

              tenantStatus:
                string;

              membershipRole:
                string;

              membershipStatus:
                string;

              passwordHash:
                string;
            }>(
              `
                SELECT
                  u.email,

                  u.normalized_email
                    AS "normalizedEmail",

                  u.display_name
                    AS "displayName",

                  u.status
                    AS "userStatus",

                  t.name
                    AS "tenantName",

                  t.status
                    AS "tenantStatus",

                  m.role
                    AS "membershipRole",

                  m.status
                    AS "membershipStatus",

                  pc.password_hash
                    AS "passwordHash"

                FROM users u

                INNER JOIN
                  tenant_memberships m
                  ON m.user_id = u.id

                INNER JOIN
                  tenants t
                  ON t.id = m.tenant_id

                INNER JOIN
                  password_credentials pc
                  ON pc.user_id = u.id

                WHERE
                  u.id = $1
                  AND t.id = $2
              `,
              [
                userId,
                tenantId,
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
              'Expected persisted identity',
            );
          }

          expect(
            row.email,
          ).toBe(
            email,
          );

          expect(
            row.normalizedEmail,
          ).toBe(
            email.toLowerCase(),
          );

          expect(
            row.displayName,
          ).toBe(
            'Usuário Integration',
          );

          expect(
            row.userStatus,
          ).toBe(
            'active',
          );

          expect(
            row.tenantStatus,
          ).toBe(
            'active',
          );

          expect(
            row.membershipRole,
          ).toBe(
            'owner',
          );

          expect(
            row.membershipStatus,
          ).toBe(
            'active',
          );

          expect(
            row.passwordHash,
          ).not.toBe(
            password,
          );

          expect(
            row.passwordHash
              .startsWith(
                '$argon2id$',
              ),
          ).toBe(true);

          await expect(
            passwordHasher.verify(
              password,
              row.passwordHash,
            ),
          ).resolves.toBe(
            true,
          );

          /*
           * A senha plaintext não pode
           * aparecer nos campos textuais
           * do núcleo Identity.
           */
          const plaintextSearch =
            await pool.query<{
              found: boolean;
            }>(
              `
                SELECT (
                  EXISTS (
                    SELECT 1
                    FROM users
                    WHERE
                      email = $1
                      OR normalized_email = $1
                      OR display_name = $1
                      OR status = $1
                  )

                  OR EXISTS (
                    SELECT 1
                    FROM tenants
                    WHERE
                      name = $1
                      OR status = $1
                  )

                  OR EXISTS (
                    SELECT 1
                    FROM tenant_memberships
                    WHERE
                      role = $1
                      OR status = $1
                  )

                  OR EXISTS (
                    SELECT 1
                    FROM password_credentials
                    WHERE
                      password_hash = $1
                  )
                ) AS found
              `,
              [
                password,
              ],
            );

          expect(
            plaintextSearch
              .rows[0]
              ?.found,
          ).toBe(false);
        } finally {
          await cleanupIdentity(
            userId,
            tenantId,
          );
        }
      },
    );

    it(
      'rejects a duplicated normalized email without creating orphan identity data',
      async () => {
        const firstUserId =
          parseUuid(
            randomUUID(),
          );

        const firstTenantId =
          parseUuid(
            randomUUID(),
          );

        const secondUserId =
          parseUuid(
            randomUUID(),
          );

        const secondTenantId =
          parseUuid(
            randomUUID(),
          );

        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const firstHandler =
          createHandler(
            firstUserId,
            firstTenantId,
          );

        const secondHandler =
          createHandler(
            secondUserId,
            secondTenantId,
          );

        try {
          await firstHandler.execute({
            email:
              `Integration.${uniqueValue}@Example.COM`,

            displayName:
              'Primeiro Usuário',

            tenantName:
              `Primeiro Tenant ${uniqueValue}`,

            password:
              'primeira senha longa e segura',
          });

          await expect(
            secondHandler.execute({
              email:
                `integration.${uniqueValue}@example.com`,

              displayName:
                'Segundo Usuário',

              tenantName:
                `Segundo Tenant ${uniqueValue}`,

              password:
                'segunda senha longa e segura',
            }),
          ).rejects.toBeInstanceOf(
            UserEmailAlreadyExistsError,
          );

          const secondUser =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM users

                WHERE id = $1
              `,
              [
                secondUserId,
              ],
            );

          expect(
            Number(
              secondUser
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const secondTenant =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM tenants

                WHERE id = $1
              `,
              [
                secondTenantId,
              ],
            );

          expect(
            Number(
              secondTenant
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const secondMembership =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM tenant_memberships

                WHERE
                  user_id = $1
                  OR tenant_id = $2
              `,
              [
                secondUserId,
                secondTenantId,
              ],
            );

          expect(
            Number(
              secondMembership
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const secondCredential =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM password_credentials

                WHERE user_id = $1
              `,
              [
                secondUserId,
              ],
            );

          expect(
            Number(
              secondCredential
                .rows[0]
                ?.count,
            ),
          ).toBe(0);
        } finally {
          await cleanupIdentity(
            secondUserId,
            secondTenantId,
          );

          await cleanupIdentity(
            firstUserId,
            firstTenantId,
          );
        }
      },
    );

    it(
      'rolls back a user inserted before a later database failure',
      async () => {
        const userId =
          parseUuid(
            randomUUID(),
          );

        const occupiedTenantId =
          parseUuid(
            randomUUID(),
          );

        const uniqueValue =
          randomUUID();

        /*
         * Criamos previamente um tenant
         * com o UUID que o handler tentará
         * usar.
         *
         * Assim:
         *
         * INSERT user   -> sucesso
         * INSERT tenant -> falha
         *
         * e o Unit of Work deve desfazer
         * o INSERT anterior.
         */
        await pool.query(
          `
            INSERT INTO tenants (
              id,
              name,
              status
            )
            VALUES (
              $1,
              $2,
              'active'
            )
          `,
          [
            occupiedTenantId,
            `Tenant ocupado ${uniqueValue}`,
          ],
        );

        const handler =
          createHandler(
            userId,
            occupiedTenantId,
          );

        try {
          await expect(
            handler.execute({
              email:
                `rollback.${uniqueValue}@example.com`,

              displayName:
                'Rollback Integration',

              tenantName:
                `Tenant que falhará ${uniqueValue}`,

              password:
                'senha longa para testar rollback',
            }),
          ).rejects.toMatchObject({
            code:
              '23505',
          });

          const persistedUser =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM users

                WHERE id = $1
              `,
              [
                userId,
              ],
            );

          expect(
            Number(
              persistedUser
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const membership =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM tenant_memberships

                WHERE user_id = $1
              `,
              [
                userId,
              ],
            );

          expect(
            Number(
              membership
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const credential =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM password_credentials

                WHERE user_id = $1
              `,
              [
                userId,
              ],
            );

          expect(
            Number(
              credential
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const occupiedTenant =
            await pool.query<{
              count: string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM tenants

                WHERE id = $1
              `,
              [
                occupiedTenantId,
              ],
            );

          /*
           * O tenant utilizado para
           * provocar a colisão deve
           * continuar existindo.
           */
          expect(
            Number(
              occupiedTenant
                .rows[0]
                ?.count,
            ),
          ).toBe(1);
        } finally {
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
              occupiedTenantId,
            ],
          );
        }
      },
    );
  },
);