import type {
  CreateProductHandler,
  GetProductByIdHandler,
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

interface CreateProductBody {
  readonly sku: string;
  readonly name: string;
  readonly categoryId: string;
}

interface CreateProductHeaders {
  readonly 'x-tenant-id': string;
}

export interface ProductsRouteDependencies {
  readonly createProductHandler:
    CreateProductHandler;

  readonly idGenerator:
    IdGenerator;

  readonly logger:
    Logger;

  readonly monotonicClock:
    MonotonicClock;

    readonly getProductByIdHandler:
  GetProductByIdHandler;
}

interface GetProductParams {
  readonly id: string;
}

export function createProductsRoute(
  dependencies:
    ProductsRouteDependencies,
): FastifyPluginAsync {
  return async function productsRoute(
    app,
  ): Promise<void> {
    app.post<{
      Body: CreateProductBody;
      Headers: CreateProductHeaders;
    }>(
      '/products',
      {
        schema: {
          headers: {
            type: 'object',

            required: [
              'x-tenant-id',
            ],

            properties: {
              'x-tenant-id': {
                type: 'string',
              },
            },
          },

          body: {
            type: 'object',

            additionalProperties:
              false,

            required: [
              'sku',
              'name',
              'categoryId',
            ],

            properties: {
              sku: {
                type: 'string',
              },

              name: {
                type: 'string',
              },

              categoryId: {
                type: 'string',
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
   app.get<{
      Params: GetProductParams;
      Headers: CreateProductHeaders;
    }>(
      '/products/:id',
      {
        schema: {
          headers: {
            type: 'object',

            required: [
              'x-tenant-id',
            ],

            properties: {
              'x-tenant-id': {
                type: 'string',
              },
            },
          },

          params: {
            type: 'object',

            required: [
              'id',
            ],

            properties: {
              id: {
                type: 'string',
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

        if (product === null) {
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