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

const idGenerator =
  new RandomUuidGenerator();

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
    Array.isArray(value)
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
  'Category HTTP contracts',
  () => {
    it(
      'returns 401 when category creation is unauthenticated',
      async () => {
        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/categories',

            payload: {
              name:
                'Blusas',
            },
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
      'creates a normalized category using the authenticated tenant and writes CategoryCreated to the outbox',
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
                'category-create',
            });

          /*
           * O cliente envia somente
           * dados da Category.
           *
           * tenantId vem exclusivamente
           * da sessão autenticada.
           */
          const response =
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
                  '  Blusas   Femininas  ',
              },
            });

          expect(
            response.statusCode,
          ).toBe(201);

          const created =
            response.json<{
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
            }>();

          /*
           * Tenant vem da sessão.
           */
          expect(
            created.tenantId,
          ).toBe(
            identity.tenantId,
          );

          /*
           * O nome de exibição é
           * normalizado:
           *
           * trim
           * + espaços internos
           * colapsados.
           */
          expect(
            created.name,
          ).toBe(
            'Blusas Femininas',
          );

          expect(
            created.status,
          ).toBe(
            'active',
          );

          expect(
            created.createdAt,
          ).toEqual(
            expect.any(
              String,
            ),
          );

          expect(
            created.updatedAt,
          ).toEqual(
            expect.any(
              String,
            ),
          );

          /*
           * Confirma o write model
           * diretamente no PostgreSQL.
           */
          const persistedResult =
            await pool.query<{
              id:
                string;

              tenantId:
                string;

              name:
                string;

              normalizedName:
                string;

              status:
                string;
            }>(
              `
                SELECT
                  id,

                  tenant_id
                    AS "tenantId",

                  name,

                  normalized_name
                    AS "normalizedName",

                  status

                FROM categories

                WHERE id = $1
              `,
              [
                created.id,
              ],
            );

          expect(
            persistedResult.rows,
          ).toHaveLength(1);

          expect(
            persistedResult.rows[0],
          ).toEqual({
            id:
              created.id,

            tenantId:
              identity.tenantId,

            name:
              'Blusas Femininas',

            normalizedName:
              'blusas femininas',

            status:
              'active',
          });

          /*
           * Category e seu evento
           * precisam ter sido gravados
           * atomicamente.
           */
          const eventResult =
            await pool.query<{
              eventId:
                string;

              tenantId:
                string;

              correlationId:
                string;

              causationId:
                string | null;

              aggregateType:
                string;

              aggregateId:
                string;

              eventName:
                string;

              eventVersion:
                number;

              payload: {
                categoryId:
                  string;

                name:
                  string;

                status:
                  string;

                createdAt:
                  string;
              };

              processedAt:
                Date | null;
            }>(
              `
                SELECT
                  event_id
                    AS "eventId",

                  tenant_id
                    AS "tenantId",

                  correlation_id
                    AS "correlationId",

                  causation_id
                    AS "causationId",

                  aggregate_type
                    AS "aggregateType",

                  aggregate_id
                    AS "aggregateId",

                  event_name
                    AS "eventName",

                  event_version
                    AS "eventVersion",

                  payload,

                  processed_at
                    AS "processedAt"

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND aggregate_id = $2

                LIMIT 1
              `,
              [
                identity.tenantId,

                created.id,
              ],
            );

          const event =
            eventResult.rows[0];

          expect(
            event,
          ).toBeDefined();

          expect(
            event,
          ).toEqual(
            expect.objectContaining({
              tenantId:
                identity.tenantId,

              aggregateType:
                'Category',

              aggregateId:
                created.id,

              eventName:
                'CategoryCreated',

              eventVersion:
                1,

              processedAt:
                null,
            }),
          );

          expect(
            event?.correlationId,
          ).toEqual(
            expect.any(
              String,
            ),
          );

          expect(
            event?.causationId,
          ).toEqual(
            expect.any(
              String,
            ),
          );

          expect(
            event?.payload,
          ).toEqual({
            categoryId:
              created.id,

            name:
              'Blusas Femininas',

            status:
              'active',

            createdAt:
              created.createdAt,
          });
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
      'returns 400 for an empty category name without persisting anything',
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
                'category-invalid',
            });

          const response =
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
                  '      ',
              },
            });

          expect(
            response.statusCode,
          ).toBe(400);

          expect(
            response.json(),
          ).toEqual({
            code:
              'INVALID_INPUT',

            message:
              'Os dados enviados são inválidos.',
          });

          const categoryCount =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM categories

                WHERE tenant_id = $1
              `,
              [
                identity.tenantId,
              ],
            );

          expect(
            Number(
              categoryCount
                .rows[0]
                ?.count,
            ),
          ).toBe(0);

          const eventCount =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND event_name =
                    'CategoryCreated'
              `,
              [
                identity.tenantId,
              ],
            );

          expect(
            Number(
              eventCount
                .rows[0]
                ?.count,
            ),
          ).toBe(0);
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
      'returns 409 for the same normalized name in one tenant but allows the name in another tenant',
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
                'category-duplicate-a',
            });

          identityB =
            await createAuthenticatedIdentity({
              app,

              pool,

              prefix:
                'category-duplicate-b',
            });

          /*
           * Primeira Category no
           * Tenant A.
           */
          const first =
            await app.inject({
              method:
                'POST',

              url:
                '/categories',

              headers: {
                cookie:
                  identityA.cookie,
              },

              payload: {
                name:
                  'Blusas',
              },
            });

          expect(
            first.statusCode,
          ).toBe(201);

          /*
           * Mesmo nome semântico.
           *
           * Diferenças de caixa e
           * espaços não devem burlar
           * a unicidade.
           */
          const duplicate =
            await app.inject({
              method:
                'POST',

              url:
                '/categories',

              headers: {
                cookie:
                  identityA.cookie,
              },

              payload: {
                name:
                  '   bLuSaS   ',
              },
            });

          expect(
            duplicate.statusCode,
          ).toBe(409);

          expect(
            duplicate.json(),
          ).toEqual({
            code:
              'CATEGORY_NAME_ALREADY_EXISTS',

            message:
              'Já existe uma categoria com este nome.',
          });

          /*
           * Em outro tenant, o mesmo
           * nome continua permitido.
           */
          const otherTenant =
            await app.inject({
              method:
                'POST',

              url:
                '/categories',

              headers: {
                cookie:
                  identityB.cookie,
              },

              payload: {
                name:
                  'BLUSAS',
              },
            });

          expect(
            otherTenant.statusCode,
          ).toBe(201);

          const categoryA =
            first.json<{
              tenantId:
                string;

              name:
                string;
            }>();

          const categoryB =
            otherTenant.json<{
              tenantId:
                string;

              name:
                string;
            }>();

          expect(
            categoryA.tenantId,
          ).toBe(
            identityA.tenantId,
          );

          expect(
            categoryB.tenantId,
          ).toBe(
            identityB.tenantId,
          );

          /*
           * Nome de exibição preserva
           * a forma enviada na criação,
           * depois do trim/colapso.
           */
          expect(
            categoryA.name,
          ).toBe(
            'Blusas',
          );

          expect(
            categoryB.name,
          ).toBe(
            'BLUSAS',
          );

          const persistedA =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM categories

                WHERE
                  tenant_id = $1
                  AND normalized_name =
                    'blusas'
              `,
              [
                identityA.tenantId,
              ],
            );

          const persistedB =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM categories

                WHERE
                  tenant_id = $1
                  AND normalized_name =
                    'blusas'
              `,
              [
                identityB.tenantId,
              ],
            );

          expect(
            Number(
              persistedA
                .rows[0]
                ?.count,
            ),
          ).toBe(1);

          expect(
            Number(
              persistedB
                .rows[0]
                ?.count,
            ),
          ).toBe(1);
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
          `category-no-tenant.${uniqueValue}@example.com`;

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
           * Cria o primeiro tenant.
           */
          const registration =
            await registerOwner
              .execute({
                email,

                displayName:
                  'Category no tenant E2E',

                tenantName:
                  `Tenant Category A ${uniqueValue}`,

                password,
              });

          userId =
            registration.userId;

          tenantAId =
            registration.tenantId;

          /*
           * Adiciona um segundo tenant
           * ao mesmo usuário.
           *
           * No próximo login não haverá
           * escolha automática de tenant.
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

              `Tenant Category B ${uniqueValue}`,
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

          /*
           * Há autenticação válida,
           * porém nenhum contexto
           * empresarial ativo.
           */
          const response =
            await app.inject({
              method:
                'POST',

              url:
                '/categories',

              headers: {
                cookie,
              },

              payload: {
                name:
                  'Blusas',
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

          /*
           * A falha precisa acontecer
           * antes de qualquer escrita
           * no Catalog.
           */
          const categoryCount =
            await pool.query<{
              count:
                string;
            }>(
              `
                SELECT
                  count(*)::text
                    AS count

                FROM categories

                WHERE tenant_id = ANY(
                  $1::uuid[]
                )
              `,
              [
                [
                  tenantAId,
                  tenantBId,
                ],
              ],
            );

          expect(
            Number(
              categoryCount
                .rows[0]
                ?.count,
            ),
          ).toBe(0);
        } finally {
          /*
           * Catalog primeiro.
           */
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

          /*
           * Remover User elimina
           * sessão, credential e
           * memberships por cascade.
           */
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

          /*
           * Depois removemos tenants.
           */
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