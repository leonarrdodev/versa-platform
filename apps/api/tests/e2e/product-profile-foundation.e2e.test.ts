import {
  randomUUID,
} from 'node:crypto';

import {
  createDatabasePool,
} from '@versa/database';

import type {
  Logger,
} from '@versa/observability';

import {
  PerformanceMonotonicClock,
} from '@versa/observability';

import {
  RandomUuidGenerator,
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
  processNextOutboxEvent,
} from '../../../worker/src/outbox/process-next-outbox-event.js';

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

const retryPolicy = {
  maxAttempts:
    5,

  baseDelayMs:
    1_000,

  maxDelayMs:
    60_000,
} as const;

let pool:
  ReturnType<
    typeof createDatabasePool
  >;

let app:
  FastifyInstance;

const monotonicClock =
  new PerformanceMonotonicClock();

const workerIdGenerator =
  new RandomUuidGenerator();

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
  'Product profile foundation',
  () => {
    it(
      'creates, persists, projects and reads brand and description',
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
                'product-profile',
            });

          const categoryId =
            await createTestCategory({
              pool,

              tenantId:
                identity.tenantId,

              name:
                'Blusas',
            });

          const response =
            await app.inject({
              method:
                'POST',

              url:
                '/products',

              headers: {
                cookie:
                  identity.cookie,
              },

              payload: {
                sku:
                  `PROFILE-${randomUUID()}`,

                name:
                  'Blusa Canelada',

                categoryId,

                brand:
                  '  Versa   Wear  ',

                description:
                  '  Tecido canelado.\r\nCaimento confortável.  ',
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
            }>();

          expect(
            created.tenantId,
          ).toBe(
            identity.tenantId,
          );

          /*
           * Command model.
           */
          const commandProduct =
            await pool.query<{
              brand:
                string | null;

              description:
                string | null;
            }>(
              `
                SELECT
                  brand,
                  description

                FROM products

                WHERE
                  tenant_id = $1
                  AND id = $2
              `,
              [
                identity.tenantId,
                created.id,
              ],
            );

          expect(
            commandProduct.rows[0],
          ).toEqual({
            brand:
              'Versa Wear',

            description:
              'Tecido canelado.\nCaimento confortável.',
          });

          /*
           * ProductCreated.
           */
          const eventResult =
            await pool.query<{
              eventId:
                string;

              payload:
                Record<
                  string,
                  unknown
                >;
            }>(
              `
                SELECT
                  event_id
                    AS "eventId",

                  payload

                FROM event_outbox

                WHERE
                  tenant_id = $1
                  AND aggregate_id = $2
                  AND event_name =
                    'ProductCreated'

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
            event?.payload,
          ).toEqual(
            expect.objectContaining({
              brand:
                'Versa Wear',

              description:
                'Tecido canelado.\nCaimento confortável.',
            }),
          );

          if (
            event ===
            undefined
          ) {
            throw new Error(
              'Expected ProductCreated event',
            );
          }

          /*
           * Faz este evento ficar
           * imediatamente elegível e
           * prioritário para o worker.
           */
          await pool.query(
            `
              UPDATE event_outbox

              SET
                next_attempt_at =
                  '1900-01-01T00:00:00Z',

                created_at =
                  '1900-01-01T00:00:00Z'

              WHERE event_id = $1
            `,
            [
              event.eventId,
            ],
          );

          const processed =
            await processNextOutboxEvent({
              pool,

              idGenerator:
                workerIdGenerator,

              logger,

              monotonicClock,

              retryPolicy,
            });

          expect(
            processed,
          ).toBe(true);

          /*
           * Read model através da
           * API real.
           */
          const getResponse =
            await app.inject({
              method:
                'GET',

              url:
                `/products/${created.id}`,

              headers: {
                cookie:
                  identity.cookie,
              },
            });

          expect(
            getResponse.statusCode,
          ).toBe(200);

          expect(
            getResponse.json(),
          ).toEqual(
            expect.objectContaining({
              id:
                created.id,

              tenantId:
                identity.tenantId,

              name:
                'Blusa Canelada',

              brand:
                'Versa Wear',

              description:
                'Tecido canelado.\nCaimento confortável.',

              categoryId,
            }),
          );

          /*
           * Confirma também a listagem.
           */
          const listResponse =
            await app.inject({
              method:
                'GET',

              url:
                '/products?limit=20&offset=0',

              headers: {
                cookie:
                  identity.cookie,
              },
            });

          expect(
            listResponse.statusCode,
          ).toBe(200);

          const list =
            listResponse.json<{
              items:
                Array<{
                  id:
                    string;

                  brand?:
                    string;

                  description?:
                    string;
                }>;
            }>();

          expect(
            list.items,
          ).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                id:
                  created.id,

                brand:
                  'Versa Wear',

                description:
                  'Tecido canelado.\nCaimento confortável.',
              }),
            ]),
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
  },
);