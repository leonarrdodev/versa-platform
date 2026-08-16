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

interface ProductHeaders {
  readonly 'x-tenant-id':
    string;
}

interface CreateProductBody {
  readonly sku:
    string;

  readonly name:
    string;

  readonly categoryId:
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

      Headers:
        ProductHeaders;
    }>(
      '/products',
      {
        schema: {
          headers: {
            type:
              'object',

            required: [
              'x-tenant-id',
            ],

            properties: {
              'x-tenant-id': {
                type:
                  'string',
              },
            },
          },

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
            },
          },
        },
      },

      async (
        request,
        reply,
      ) => {
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
            tenantId:
              request.headers[
                'x-tenant-id'
              ],

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
                  tenantId:
                    request.headers[
                      'x-tenant-id'
                    ],

                  sku:
                    request.body.sku,

                  name:
                    request.body.name,

                  categoryId:
                    request.body
                      .categoryId,
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
              tenantId:
                request.headers[
                  'x-tenant-id'
                ],

              sku:
                request.body.sku,
            },
          });

          throw error;
        }
      },
    );

    /*
     * Lista paginada dos produtos
     * já disponíveis no read model.
     */
    app.get<{
      Headers:
        ProductHeaders;

      Querystring:
        GetProductsQuerystring;
    }>(
      '/products',
      {
        schema: {
          headers: {
            type:
              'object',

            required: [
              'x-tenant-id',
            ],

            properties: {
              'x-tenant-id': {
                type:
                  'string',
              },
            },
          },

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
        const result =
          await dependencies
            .getProductsHandler
            .execute({
              tenantId:
                request.headers[
                  'x-tenant-id'
                ],

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

      Headers:
        ProductHeaders;
    }>(
      '/products/:id',
      {
        schema: {
          headers: {
            type:
              'object',

            required: [
              'x-tenant-id',
            ],

            properties: {
              'x-tenant-id': {
                type:
                  'string',
              },
            },
          },

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
        const product =
          await dependencies
            .getProductByIdHandler
            .execute({
              tenantId:
                request.headers[
                  'x-tenant-id'
                ],

              productId:
                request.params.id,
            });

        if (
          product === null
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