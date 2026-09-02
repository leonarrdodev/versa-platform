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

const clock =
  new SystemClock();

const idGenerator =
  new RandomUuidGenerator();

const passwordHasher =
  new Argon2PasswordHasher();

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
  'Active tenant selection',
  () => {
    it(
      'switches the authenticated session between allowed tenants and preserves tenant isolation',
      async () => {
        const uniqueValue =
          randomUUID()
            .replaceAll(
              '-',
              '',
            );

        const email =
          `tenant-switch.${uniqueValue}@example.com`;

        const password =
          'uma senha longa e segura';

        const displayName =
          'Tenant Selection E2E';

        const tenantAName =
          `Tenant A ${uniqueValue}`;

        const tenantBName =
          `Tenant B ${uniqueValue}`;

        const tenantCName =
          `Tenant C ${uniqueValue}`;

        const tenantBId =
          randomUUID();

        const tenantCId =
          randomUUID();

        const sku =
          `SKU-${randomUUID()}`
            .toUpperCase();

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

        let tenantAId:
          string | null =
            null;

        try {
          /*
           * 1. RegisterOwner cria:
           *
           * User
           * └── Tenant A (owner)
           */
          const registration =
            await registerOwner
              .execute({
                email,

                displayName,

                tenantName:
                  tenantAName,

                password,
              });

          userId =
            registration.userId;

          tenantAId =
            registration.tenantId;

          /*
           * 2. Adicionamos uma segunda
           * empresa disponível para
           * o mesmo usuário.
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
              tenantBName,
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

          /*
           * Tenant C existe e está
           * ativo, mas o usuário NÃO
           * possui membership nele.
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
              tenantCId,
              tenantCName,
            ],
          );

          /*
           * Product agora exige uma
           * Category real pertencente
           * ao mesmo tenant.
           *
           * Cada tenant recebe sua
           * própria Category.
           */
          const categoryAId =
            await createTestCategory({
              pool,

              tenantId:
                tenantAId,

              name:
                `Categoria Tenant A ${uniqueValue}`,
            });

          const categoryBId =
            await createTestCategory({
              pool,

              tenantId:
                tenantBId,

              name:
                `Categoria Tenant B ${uniqueValue}`,
            });

          /*
           * 3. Login.
           *
           * Como existem duas
           * memberships ativas,
           * nenhuma deve ser escolhida
           * automaticamente.
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
            loginResponse.statusCode,
          ).toBe(200);

          const loginBody =
            loginResponse.json<{
              session: {
                id:
                  string;

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
              loginResponse.headers[
                'set-cookie'
              ],
            );

          /*
           * 4. Sem tenant ativo,
           * Catalog deve recusar
           * contexto operacional.
           */
          const withoutTenant =
            await app.inject({
              method:
                'GET',

              url:
                '/products?limit=20&offset=0',

              headers: {
                cookie,
              },
            });

          expect(
            withoutTenant.statusCode,
          ).toBe(403);

          expect(
            withoutTenant.json(),
          ).toEqual({
            code:
              'ACTIVE_TENANT_REQUIRED',

            message:
              'Selecione uma empresa para continuar.',
          });

          /*
           * 5. Lista empresas
           * disponíveis.
           */
          const tenantsResponse =
            await app.inject({
              method:
                'GET',

              url:
                '/auth/tenants',

              headers: {
                cookie,
              },
            });

          expect(
            tenantsResponse.statusCode,
          ).toBe(200);

          const tenantsBody =
            tenantsResponse.json<{
              tenants:
                Array<{
                  id:
                    string;

                  name:
                    string;

                  role:
                    string;
                }>;
            }>();

          expect(
            tenantsBody.tenants,
          ).toHaveLength(2);

          expect(
            tenantsBody.tenants,
          ).toEqual(
            expect.arrayContaining([
              {
                id:
                  tenantAId,

                name:
                  tenantAName,

                role:
                  'owner',
              },

              {
                id:
                  tenantBId,

                name:
                  tenantBName,

                role:
                  'admin',
              },
            ]),
          );

          expect(
            tenantsBody.tenants
              .some(
                (
                  tenant,
                ) =>
                  tenant.id ===
                  tenantCId,
              ),
          ).toBe(false);

          /*
           * 6. Seleciona Tenant B.
           */
          const selectB =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/active-tenant',

              headers: {
                cookie,
              },

              payload: {
                tenantId:
                  tenantBId,
              },
            });

          expect(
            selectB.statusCode,
          ).toBe(200);

          expect(
            selectB.json(),
          ).toEqual(
            expect.objectContaining({
              activeTenant: {
                id:
                  tenantBId,

                name:
                  tenantBName,

                role:
                  'admin',
              },
            }),
          );

          /*
           * 7. Cria produto usando a
           * mesma sessão.
           *
           * Nenhum tenantId é enviado.
           *
           * A Category utilizada também
           * pertence ao Tenant B.
           */
          const productBResponse =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie,
              },

              payload: {
                sku,

                name:
                  'Produto Tenant B',

                categoryId:
                  categoryBId,
              },
            });

          expect(
            productBResponse.statusCode,
          ).toBe(201);

          const productB =
            productBResponse.json<{
              id:
                string;

              tenantId:
                string;
            }>();

          expect(
            productB.tenantId,
          ).toBe(
            tenantBId,
          );

          /*
           * 8. Troca a MESMA sessão
           * para Tenant A.
           */
          const selectA =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/active-tenant',

              headers: {
                cookie,
              },

              payload: {
                tenantId:
                  tenantAId,
              },
            });

          expect(
            selectA.statusCode,
          ).toBe(200);

          expect(
            selectA.json(),
          ).toEqual(
            expect.objectContaining({
              activeTenant: {
                id:
                  tenantAId,

                name:
                  tenantAName,

                role:
                  'owner',
              },
            }),
          );

          /*
           * 9. O MESMO SKU deve poder
           * existir no Tenant A.
           *
           * Isso prova que o Catalog
           * passou a usar o novo
           * contexto da sessão.
           *
           * A Category agora também é
           * específica do Tenant A.
           */
          const productAResponse =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie,
              },

              payload: {
                sku,

                name:
                  'Produto Tenant A',

                categoryId:
                  categoryAId,
              },
            });

          expect(
            productAResponse.statusCode,
          ).toBe(201);

          const productA =
            productAResponse.json<{
              id:
                string;

              tenantId:
                string;
            }>();

          expect(
            productA.tenantId,
          ).toBe(
            tenantAId,
          );

          expect(
            productA.tenantId,
          ).not.toBe(
            productB.tenantId,
          );

          /*
           * 10. Tenta selecionar C,
           * onde não existe membership.
           */
          const forbiddenSelection =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/active-tenant',

              headers: {
                cookie,
              },

              payload: {
                tenantId:
                  tenantCId,
              },
            });

          expect(
            forbiddenSelection.statusCode,
          ).toBe(403);

          expect(
            forbiddenSelection.json(),
          ).toEqual({
            code:
              'ACTIVE_TENANT_NOT_ALLOWED',

            message:
              'A empresa selecionada não está disponível para esta sessão.',
          });

          /*
           * 11. A tentativa proibida
           * NÃO pode alterar o tenant
           * ativo anterior.
           */
          const sessionAfterForbidden =
            await app.inject({
              method:
                'GET',

              url:
                '/auth/session',

              headers: {
                cookie,
              },
            });

          expect(
            sessionAfterForbidden
              .statusCode,
          ).toBe(200);

          expect(
            sessionAfterForbidden
              .json(),
          ).toEqual(
            expect.objectContaining({
              activeTenant: {
                id:
                  tenantAId,

                name:
                  tenantAName,

                role:
                  'owner',
              },
            }),
          );

          /*
           * 12. Volta para B.
           */
          const selectBAgain =
            await app.inject({
              method:
                'POST',

              url:
                '/auth/active-tenant',

              headers: {
                cookie,
              },

              payload: {
                tenantId:
                  tenantBId,
              },
            });

          expect(
            selectBAgain.statusCode,
          ).toBe(200);

          /*
           * Como B já possui esse SKU,
           * agora deve haver conflito.
           *
           * É uma prova adicional de
           * que a mesma sessão realmente
           * trocou o contexto do Catalog.
           *
           * A Category utilizada volta
           * a ser a Category do Tenant B.
           */
          const duplicateInB =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie,
              },

              payload: {
                sku,

                name:
                  'Produto duplicado B',

                categoryId:
                  categoryBId,
              },
            });

          expect(
            duplicateInB.statusCode,
          ).toBe(409);

          expect(
            duplicateInB.json(),
          ).toEqual({
            code:
              'PRODUCT_SKU_ALREADY_EXISTS',

            message:
              'Já existe um produto com este SKU.',
          });

          /*
           * 13. Confirma também no
           * banco que foram criados
           * exatamente nos tenants
           * esperados.
           */
          const persistedProducts =
            await pool.query<{
              id:
                string;

              tenantId:
                string;
            }>(
              `
                SELECT
                  id,

                  tenant_id
                    AS "tenantId"

                FROM products

                WHERE id = ANY($1::uuid[])

                ORDER BY id
              `,
              [
                [
                  productA.id,
                  productB.id,
                ],
              ],
            );

          expect(
            persistedProducts.rows,
          ).toHaveLength(2);

          expect(
            persistedProducts.rows,
          ).toEqual(
            expect.arrayContaining([
              {
                id:
                  productA.id,

                tenantId:
                  tenantAId,
              },

              {
                id:
                  productB.id,

                tenantId:
                  tenantBId,
              },
            ]),
          );
        } finally {
          /*
           * Catalog precisa ser
           * removido antes de Identity.
           *
           * O helper respeita:
           *
           * product_read_model
           * → event_outbox
           * → products
           * → categories
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
           * Remover o usuário elimina
           * sessions, credentials e
           * memberships por cascade.
           */
          if (
            userId !== null
          ) {
            await pool.query(
              `
                DELETE FROM users
                WHERE id = $1
              `,
              [
                userId,
              ],
            );
          }

          /*
           * Agora podemos remover os
           * tenants do cenário.
           */
          for (
            const tenantId
            of [
              tenantAId,
              tenantBId,
              tenantCId,
            ]
          ) {
            if (
              tenantId !== null
            ) {
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
          }
        }
      },
    );
  },
);