import Fastify, { type FastifyInstance } from 'fastify';

import { healthRoute } from './routes/health.route.js';

interface BuildAppOptions {
  logger?: boolean;
}

export function buildApp(
  options: BuildAppOptions = {},
): FastifyInstance {
  const app = Fastify({
    logger: options.logger ?? true,
  });

  app.register(healthRoute);

  return app;
}