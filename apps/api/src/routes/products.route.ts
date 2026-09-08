import type {
  CreateProductHandler,
  GetProductByIdHandler,
  GetProductsHandler,
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

interface CreateProductBody {
  readonly sku:
    string;

  readonly name:
    string;

  readonly categoryId:
    string;

  readonly brand?:
    string;

  readonly description?:
    string;
}

interface GetProductParams {
  readonly id:
    string;
}

interface GetProductsQuerystring {
  readonly limit?:
    number;

  readonly offset?:
    number;
}

export interface ProductsRouteDependencies {
  readonly createProductHandler:
    CreateProductHandler;

  readonly getProductByIdHandler:
    GetProductByIdHandler;

  readonly getProductsHandler:
    GetProductsHandler;

  readonly idGenerator:
    IdGenerator;

  readonly logger:
    Logger;

  readonly monotonicClock:
    MonotonicClock;

  readonly requireAuthentication:
    RequireAuthentication;
}

export function createProductsRoute(
  dependencies:
    ProductsRouteDependencies,
): FastifyPluginAsync {
  return async function productsRoute(
    app,
  ): Promise<void> {
    app.post<{
      Body:
        CreateProductBody;
    }>(
      '/products',
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
              'sku',
              'name',
              'categoryId',
            ],

            properties: {
              sku: {
                type:
                  'string',
              },

              name: {
                type:
                  'string',
              },

              categoryId: {
                type:
                  'string',
              },

              brand: {
                type:
                  'string',
              },

              description: {
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
            'Product creation started',

          event:
            'product.creation.started',

          context:
            executionContext,

          data: {
            tenantId,

            sku:
              request.body.sku,
          },
        });

        try {
          const result =
            await dependencies
              .createProductHandler
              .execute(
                {
                  tenantId,

                  sku:
                    request.body.sku,

                  name:
                    request.body.name,

                  categoryId:
                    request.body
                      .categoryId,

                  ...(request.body.brand ===
                  undefined
                    ? {}
                    : {
                        brand:
                          request.body.brand,
                      }),

                  ...(request.body.description ===
                  undefined
                    ? {}
                    : {
                        description:
                          request.body
                            .description,
                      }),
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
              'Product creation completed',

            event:
              'product.creation.completed',

            context:
              executionContext,

            durationMs,

            data: {
              productId:
                result.id,

              tenantId:
                result.tenantId,

              sku:
                result.sku,
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
              'Product creation failed',

            event:
              'product.creation.failed',

            context:
              executionContext,

            durationMs,

            error,

            data: {
              tenantId,

              sku:
                request.body.sku,
            },
          });

          throw error;
        }
      },
    );

    app.get<{
      Querystring:
        GetProductsQuerystring;
    }>(
      '/products',
      {
        preHandler:
          dependencies
            .requireAuthentication,

        schema: {
          querystring: {
            type:
              'object',

            additionalProperties:
              false,

            properties: {
              limit: {
                type:
                  'integer',

                minimum:
                  1,

                maximum:
                  100,
              },

              offset: {
                type:
                  'integer',

                minimum:
                  0,
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

        const result =
          await dependencies
            .getProductsHandler
            .execute({
              tenantId,

              ...(request.query.limit ===
              undefined
                ? {}
                : {
                    limit:
                      request.query.limit,
                  }),

              ...(request.query.offset ===
              undefined
                ? {}
                : {
                    offset:
                      request.query.offset,
                  }),
            });

        return reply
          .code(200)
          .send(result);
      },
    );

    app.get<{
      Params:
        GetProductParams;
    }>(
      '/products/:id',
      {
        preHandler:
          dependencies
            .requireAuthentication,

        schema: {
          params: {
            type:
              'object',

            required: [
              'id',
            ],

            properties: {
              id: {
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

        const product =
          await dependencies
            .getProductByIdHandler
            .execute({
              tenantId,

              productId:
                request.params.id,
            });

        if (
          product ===
          null
        ) {
          return reply
            .code(404)
            .send({
              code:
                'PRODUCT_NOT_FOUND',

              message:
                'Produto não encontrado.',
            });
        }

        return reply
          .code(200)
          .send(product);
      },
    );
  };
}