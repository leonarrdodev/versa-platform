import type {
  CreateCategoryHandler,
  GetCategoriesHandler,
} from '@versa/catalog';

import {
  createRootExecutionContext,
} from '@versa/observability';

import type {
  Logger,
  MonotonicClock,
} from '@versa/observability';

import type {
  IdGenerator,
} from '@versa/shared-kernel';

import type {
  FastifyPluginAsync,
} from 'fastify';

import {
  getRequiredActiveTenantId,
} from '../auth/get-required-active-tenant-id.js';

import type {
  RequireAuthentication,
} from '../auth/require-authentication.js';

interface CreateCategoryBody {
  readonly name:
    string;
}

export interface CategoriesRouteDependencies {
  readonly createCategoryHandler:
    CreateCategoryHandler;

  readonly getCategoriesHandler:
    GetCategoriesHandler;

  readonly idGenerator:
    IdGenerator;

  readonly logger:
    Logger;

  readonly monotonicClock:
    MonotonicClock;

  readonly requireAuthentication:
    RequireAuthentication;
}

export function createCategoriesRoute(
  dependencies:
    CategoriesRouteDependencies,
): FastifyPluginAsync {
  return async function categoriesRoute(
    app,
  ): Promise<void> {
    app.post<{
      Body:
        CreateCategoryBody;
    }>(
      '/categories',
      {
        preHandler:
          dependencies
            .requireAuthentication,

        schema: {
          body: {
            type:
              'object',

            additionalProperties:
              false,

            required: [
              'name',
            ],

            properties: {
              name: {
                type:
                  'string',
              },
            },
          },
        },
      },

      async (
        request,
        reply,
      ) => {
        const tenantId =
          getRequiredActiveTenantId(
            request,
          );

        const executionContext =
          createRootExecutionContext(
            dependencies.idGenerator,
          );

        const startedAt =
          dependencies
            .monotonicClock
            .nowMs();

        dependencies.logger.info({
          message:
            'Category creation started',

          event:
            'category.creation.started',

          context:
            executionContext,

          data: {
            tenantId,

            name:
              request.body.name,
          },
        });

        try {
          const result =
            await dependencies
              .createCategoryHandler
              .execute(
                {
                  tenantId,

                  name:
                    request.body.name,
                },

                executionContext,
              );

          const durationMs =
            dependencies
              .monotonicClock
              .nowMs() -
            startedAt;

          dependencies.logger.info({
            message:
              'Category creation completed',

            event:
              'category.creation.completed',

            context:
              executionContext,

            durationMs,

            data: {
              categoryId:
                result.id,

              tenantId:
                result.tenantId,

              name:
                result.name,
            },
          });

          return reply
            .code(201)
            .send(result);
        } catch (error) {
          const durationMs =
            dependencies
              .monotonicClock
              .nowMs() -
            startedAt;

          dependencies.logger.error({
            message:
              'Category creation failed',

            event:
              'category.creation.failed',

            context:
              executionContext,

            durationMs,

            error,

            data: {
              tenantId,

              name:
                request.body.name,
            },
          });

          throw error;
        }
      },
    );

    app.get(
      '/categories',
      {
        preHandler:
          dependencies
            .requireAuthentication,
      },

      async (
        request,
        reply,
      ) => {
        const tenantId =
          getRequiredActiveTenantId(
            request,
          );

        const categories =
          await dependencies
            .getCategoriesHandler
            .execute({
              tenantId,
            });

        return reply
          .code(200)
          .send({
            items:
              categories,
          });
      },
    );
  };
}