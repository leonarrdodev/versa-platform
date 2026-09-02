import {
  createDatabasePool,
} from '@versa/database';

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
  createIdentityComposition,
} from './composition/identity.js';

import {
  env,
} from './config/env.js';

const pool =
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

const app =
  buildApp({
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
        env.nodeEnv ===
          'production',
    },
  });

app.addHook(
  'onClose',
  async () => {
    await pool.end();
  },
);

try {
  await app.listen({
    host:
      env.api.host,

    port:
      env.api.port,
  });
} catch (error) {
  app.log.error(
    error,
  );

  await app.close();

  process.exit(1);
}