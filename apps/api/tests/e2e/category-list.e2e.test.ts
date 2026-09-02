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

import type {
  Logger,
} from '@versa/observability';

import {
  PerformanceMonotonicClock,
} from '@versa/observability';

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
  createCatalogComposition,
} from '../../src/composition/catalog.js';

import {
  createIdentityComposition,
} from '../../src/composition/identity.js';

import {
  env,
} from '../../src/config/env.js';

import {
  cleanupAuthenticatedIdentity,
  createAuthenticatedIdentity,
} from './helpers/authenticated-identity.js';

import type {
  AuthenticatedIdentity,
} from './helpers/authenticated-identity.js';

import {
  cleanupTenantCatalog,
  createTestCategory,
} from './helpers/catalog-fixtures.js';

const logger:
Logger = {
  log() {},

  debug() {},

  info() {},

  warn() {},

  error() {},
};

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

let app:
  FastifyInstance;

const monotonicClock =
  new PerformanceMonotonicClock();

function extractCookie(
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

  const header =
    Array.isArray(
      value,
    )
      ? value[0]
      : value;

  if (
    header === undefined
  ) {
    throw new Error(
      'Expected Set-Cookie header',
    );
  }

  const cookie =
    header
      .split(';')[0];

  if (
    cookie === undefined
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

beforeAll(
  async () => {
    pool =
      createDatabasePool(
        env.database,
      );

    const catalog =
      createCatalogComposition(
        pool,
      );

    const identity =
      createIdentityComposition(
        pool,
      );

    app =
      buildApp({
        logger:
          false,

        applicationLogger:
          logger,

        catalog: {
          createCategoryHandler:
            catalog.createCategoryHandler,

          createProductHandler:
            catalog.createProductHandler,

          getCategoriesHandler:
            catalog.getCategoriesHandler,

          getProductByIdHandler:
            catalog.getProductByIdHandler,

          getProductsHandler:
            catalog.getProductsHandler,

          idGenerator:
            catalog.idGenerator,

          logger,

          monotonicClock,
        },

        identity: {
          signInHandler:
            identity.signInHandler,

          resolveSessionHandler:
            identity.resolveSessionHandler,

          revokeSessionHandler:
            identity.revokeSessionHandler,

          listAvailableTenantsHandler:
            identity.listAvailableTenantsHandler,

          setActiveTenantHandler:
            identity.setActiveTenantHandler,

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
  'Category list HTTP contracts',
  () => {
    it(
      'returns 401 when category listing is unauthenticated',
      async () => {
        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/categories',
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_SESSION',

          message:
            'Sessão inválida ou expirada.',
        });
      },
    );

    it(
      'makes a newly created category immediately available for listing',
      async () => {
        let identity:
          AuthenticatedIdentity | null =
            null;

        try {
          identity =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'category-immediate-list',
            });

          /*
           * Category é criada pelo
           * caminho real de escrita.
           */
          const creation =
            await app.inject({
              method:
                'POST',

              url:
                '/categories',

              headers: {
                cookie:
                  identity.cookie,
              },

              payload: {
                name:
                  'Blusas',
              },
            });

          expect(
            creation.statusCode,
          ).toBe(201);

          const created =
            creation.json<{
              id:
                string;

              tenantId:
                string;

              name:
                string;
            }>();

          /*
           * Não executamos worker.
           *
           * Category não usa projection
           * assíncrona neste momento.
           *
           * A consulta lê diretamente
           * de categories.
           */
          const listing =
            await app.inject({
              method:
                'GET',

              url:
                '/categories',

              headers: {
                cookie:
                  identity.cookie,
              },
            });

          expect(
            listing.statusCode,
          ).toBe(200);

          const body =
            listing.json<{
              items:
                Array<{
                  id:
                    string;

                  tenantId:
                    string;

                  name:
                    string;

                  status:
                    string;

                  createdAt:
                    string;

                  updatedAt:
                    string;
                }>;
            }>();

          expect(
            body.items,
          ).toHaveLength(1);

          expect(
            body.items[0],
          ).toEqual(
            expect.objectContaining({
              id:
                created.id,

              tenantId:
                identity.tenantId,

              name:
                'Blusas',

              status:
                'active',
            }),
          );

          expect(
            body.items[0]
              ?.createdAt,
          ).toEqual(
            expect.any(
              String,
            ),
          );

          expect(
            body.items[0]
              ?.updatedAt,
          ).toEqual(
            expect.any(
              String,
            ),
          );
        } finally {
          if (
            identity !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identity.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identity,
            );
          }
        }
      },
    );

    it(
      'returns only active categories from the authenticated tenant in deterministic order',
      async () => {
        let identityA:
          AuthenticatedIdentity | null =
            null;

        let identityB:
          AuthenticatedIdentity | null =
            null;

        try {
          identityA =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'category-list-a',
            });

          identityB =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'category-list-b',
            });

          /*
           * Inserimos fora de ordem
           * propositalmente.
           */
          await createTestCategory({
            pool,

            tenantId:
              identityA.tenantId,

            name:
              'Calcas',
          });

          await createTestCategory({
            pool,

            tenantId:
              identityA.tenantId,

            name:
              'Acessorios',
          });

          await createTestCategory({
            pool,

            tenantId:
              identityA.tenantId,

            name:
              'Blusas',
          });

          /*
           * Categoria pertencente a
           * outro tenant.
           *
           * Ela nunca pode aparecer
           * na sessão de A.
           */
          await createTestCategory({
            pool,

            tenantId:
              identityB.tenantId,

            name:
              'Categoria Tenant B',
          });

          /*
           * Cria uma Category de A e
           * simula estado archived.
           *
           * Ainda não temos o comando
           * de arquivamento, mas o
           * read side já deve respeitar
           * o contrato de somente active.
           */
          const archivedId =
            await createTestCategory({
              pool,

              tenantId:
                identityA.tenantId,

              name:
                'Arquivada',
            });

          await pool.query(
            `
              UPDATE categories

              SET
                status = 'archived',
                updated_at = NOW()

              WHERE
                id = $1
                AND tenant_id = $2
            `,
            [
              archivedId,
              identityA.tenantId,
            ],
          );

          const response =
            await app.inject({
              method:
                'GET',

              url:
                '/categories',

              headers: {
                cookie:
                  identityA.cookie,
              },
            });

          expect(
            response.statusCode,
          ).toBe(200);

          const body =
            response.json<{
              items:
                Array<{
                  id:
                    string;

                  tenantId:
                    string;

                  name:
                    string;

                  status:
                    string;
                }>;
            }>();

          /*
           * Somente as três Categories
           * active do Tenant A.
           */
          expect(
            body.items,
          ).toHaveLength(3);

          expect(
            body.items.map(
              (
                category,
              ) =>
                category.name,
            ),
          ).toEqual([
            'Acessorios',
            'Blusas',
            'Calcas',
          ]);

          expect(
            body.items.every(
              (
                category,
              ) =>
                category.tenantId ===
                  identityA?.tenantId,
            ),
          ).toBe(true);

          expect(
            body.items.every(
              (
                category,
              ) =>
                category.status ===
                  'active',
            ),
          ).toBe(true);

          expect(
            body.items.some(
              (
                category,
              ) =>
                category.name ===
                  'Arquivada',
            ),
          ).toBe(false);

          expect(
            body.items.some(
              (
                category,
              ) =>
                category.name ===
                  'Categoria Tenant B',
            ),
          ).toBe(false);
        } finally {
          if (
            identityA !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identityA.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identityA,
            );
          }

          if (
            identityB !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              identityB.tenantId,
            );

            await cleanupAuthenticatedIdentity(
              pool,
              identityB,
            );
          }
        }
      },
    );

    it(
      'returns 403 when the authenticated session has no active tenant',
      async () => {
        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `category-list-no-tenant.${uniqueValue}@example.com`;

        const password =
          'uma senha longa e segura';

        const tenantBId =
          randomUUID();

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
                pool,
              ),
          });

        let userId:
          string | null =
            null;

        let tenantAId:
          string | null =
            null;

        try {
          /*
           * Primeiro tenant.
           */
          const registration =
            await registerOwner
              .execute({
                email,

                displayName:
                  'Category list no tenant E2E',

                tenantName:
                  `Tenant List A ${uniqueValue}`,

                password,
              });

          userId =
            registration.userId;

          tenantAId =
            registration.tenantId;

          /*
           * Segundo tenant disponível
           * para o mesmo usuário.
           *
           * Isso faz o login iniciar
           * sem tenant selecionado.
           */
          await pool.query(
            `
              INSERT INTO tenants (
                id,
                name,
                status,
                created_at,
                updated_at
              )
              VALUES (
                $1,
                $2,
                'active',
                NOW(),
                NOW()
              )
            `,
            [
              tenantBId,
              `Tenant List B ${uniqueValue}`,
            ],
          );

          await pool.query(
            `
              INSERT INTO tenant_memberships (
                user_id,
                tenant_id,
                role,
                status,
                created_at,
                updated_at
              )
              VALUES (
                $1,
                $2,
                'admin',
                'active',
                NOW(),
                NOW()
              )
            `,
            [
              userId,
              tenantBId,
            ],
          );

          const login =
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
            login.statusCode,
          ).toBe(200);

          const loginBody =
            login.json<{
              session: {
                activeTenantId:
                  string | null;
              };
            }>();

          expect(
            loginBody.session
              .activeTenantId,
          ).toBeNull();

          const cookie =
            extractCookie(
              login.headers[
                'set-cookie'
              ],
            );

          const response =
            await app.inject({
              method:
                'GET',

              url:
                '/categories',

              headers: {
                cookie,
              },
            });

          expect(
            response.statusCode,
          ).toBe(403);

          expect(
            response.json(),
          ).toEqual({
            code:
              'ACTIVE_TENANT_REQUIRED',

            message:
              'Selecione uma empresa para continuar.',
          });
        } finally {
          if (
            tenantAId !==
            null
          ) {
            await cleanupTenantCatalog(
              pool,
              tenantAId,
            );
          }

          await cleanupTenantCatalog(
            pool,
            tenantBId,
          );

          if (
            userId !==
            null
          ) {
            await pool.query(
              `
                DELETE
                FROM users
                WHERE id = $1
              `,
              [
                userId,
              ],
            );
          }

          for (
            const tenantId
            of [
              tenantAId,
              tenantBId,
            ]
          ) {
            if (
              tenantId !==
              null
            ) {
              await pool.query(
                `
                  DELETE
                  FROM tenants
                  WHERE id = $1
                `,
                [
                  tenantId,
                ],
              );
            }
          }
        }
      },
    );
  },
);