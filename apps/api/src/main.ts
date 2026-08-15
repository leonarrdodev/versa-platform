import {
  PerformanceMonotonicClock,
  StructuredLogger,
  jsonConsoleSink,
} from '@versa/observability';

import {
  SystemClock,
} from '@versa/shared-kernel';

import {
  buildApp,
} from './app.js';

import {
  createCatalogComposition,
} from './composition/catalog.js';

import {
  env,
} from './config/env.js';

const catalog =
  createCatalogComposition();

const systemClock =
  new SystemClock();

const monotonicClock =
  new PerformanceMonotonicClock();

const logger =
  new StructuredLogger(
    'api',
    systemClock,
    jsonConsoleSink,
  );

const app = buildApp({
  applicationLogger:
  logger,

  catalog: {
    createProductHandler:
      catalog.createProductHandler,

    idGenerator:
      catalog.idGenerator,

    logger,

    monotonicClock,

    getProductByIdHandler:
  catalog.getProductByIdHandler,
  },
});

app.addHook(
  'onClose',
  async () => {
    await catalog.close();
  },
);

try {
  await app.listen({
    host: env.api.host,
    port: env.api.port,
  });
} catch (error) {
  app.log.error(error);

  await app.close();

  process.exit(1);
}