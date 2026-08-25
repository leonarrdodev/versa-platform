import cookie from '@fastify/cookie';

import type {
  Logger,
} from '@versa/observability';

import Fastify, {
  type FastifyInstance,
} from 'fastify';

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
  healthRoute,
} from './routes/health.route.js';

import {
  createProductsRoute,
} from './routes/products.route.js';

import type {
  ProductsRouteDependencies,
} from './routes/products.route.js';

interface BuildAppOptions {
  logger?:
    boolean;

  applicationLogger?:
    Logger;

  catalog?:
    ProductsRouteDependencies;

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

  registerApiErrorHandler(
    app,
    options.applicationLogger,
  );

  /*
   * Cookie parsing/decorators precisam
   * estar disponíveis antes das rotas
   * de autenticação.
   */
  app.register(
    cookie,
  );

  app.register(
    healthRoute,
  );

  if (
    options.catalog !==
    undefined
  ) {
    app.register(
      createProductsRoute(
        options.catalog,
      ),
    );
  }

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

  return app;
}