import Fastify, {
  type FastifyInstance,
} from 'fastify';

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
  logger?: boolean;

  catalog?:
    ProductsRouteDependencies;
}

export function buildApp(
  options: BuildAppOptions = {},
): FastifyInstance {
  const app = Fastify({
    logger:
      options.logger ?? true,
  });

  app.register(
    healthRoute,
  );

  if (
    options.catalog !== undefined
  ) {
    app.register(
      createProductsRoute(
        options.catalog,
      ),
    );
  }

  return app;
}