import cookie from '@fastify/cookie';

import type {
  Logger,
} from '@versa/observability';

import Fastify, {
  type FastifyInstance,
} from 'fastify';

import {
  createRequireAuthentication,
} from './auth/require-authentication.js';

import {
  registerApiErrorHandler,
} from './errors/register-api-error-handler.js';

import {
  createAuthRoute,
} from './routes/auth.route.js';

import type {
  AuthRouteDependencies,
} from './routes/auth.route.js';

import {
  createCategoriesRoute,
} from './routes/categories.route.js';

import type {
  CategoriesRouteDependencies,
} from './routes/categories.route.js';

import {
  healthRoute,
} from './routes/health.route.js';

import {
  createProductsRoute,
} from './routes/products.route.js';

import type {
  ProductsRouteDependencies,
} from './routes/products.route.js';

type CatalogRouteDependencies =
  Omit<
    ProductsRouteDependencies,
    'requireAuthentication'
  >
  &
  Omit<
    CategoriesRouteDependencies,
    'requireAuthentication'
  >;

interface BuildAppOptions {
  logger?:
    boolean;

  applicationLogger?:
    Logger;

  catalog?:
    CatalogRouteDependencies;

  identity?:
    AuthRouteDependencies;
}

export function buildApp(
  options:
    BuildAppOptions = {},
): FastifyInstance {
  const app =
    Fastify({
      logger:
        options.logger ?? true,
    });

  /*
   * A declaração TypeScript está em
   * types/fastify.d.ts.
   *
   * Aqui fazemos a decoração real
   * da request em runtime.
   */
  app.decorateRequest(
    'auth',
    null,
  );

  registerApiErrorHandler(
    app,
    options.applicationLogger,
  );

  /*
   * Disponibiliza request.cookies,
   * reply.setCookie() e
   * reply.clearCookie().
   */
  app.register(
    cookie,
  );

  app.register(
    healthRoute,
  );

  /*
   * As rotas de autenticação podem
   * existir independentemente do
   * Catalog.
   */
  if (
    options.identity !==
    undefined
  ) {
    app.register(
      createAuthRoute(
        options.identity,
      ),
    );
  }

  /*
   * Catalog HTTP nunca pode ser
   * exposto sem Identity.
   *
   * Isso evita iniciar por engano
   * endpoints de Catalog sem
   * autenticação.
   */
  if (
    options.catalog !==
    undefined
  ) {
    if (
      options.identity ===
      undefined
    ) {
      throw new Error(
        'Identity is required when Catalog HTTP routes are enabled',
      );
    }

    const requireAuthentication =
      createRequireAuthentication({
        resolveSessionHandler:
          options.identity
            .resolveSessionHandler,
      });

    app.register(
      createProductsRoute({
        ...options.catalog,

        requireAuthentication,
      }),
    );

    app.register(
      createCategoriesRoute({
        ...options.catalog,

        requireAuthentication,
      }),
    );
  }

  return app;
}