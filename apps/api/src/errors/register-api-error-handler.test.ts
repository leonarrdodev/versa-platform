import {
  CategoryNameAlreadyExistsError,
  ProductCategoryNotAvailableError,
  ProductSkuAlreadyExistsError,
} from '@versa/catalog';

import type {
  Logger,
} from '@versa/observability';

import {
  InvalidValueError,
} from '@versa/shared-kernel';

import Fastify from 'fastify';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  registerApiErrorHandler,
} from './register-api-error-handler.js';

function createLogger():
Logger {
  return {
    log:
      vi.fn(),

    debug:
      vi.fn(),

    info:
      vi.fn(),

    warn:
      vi.fn(),

    error:
      vi.fn(),
  };
}

describe(
  'registerApiErrorHandler',
  () => {
    it(
      'returns 400 for Fastify validation errors',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        registerApiErrorHandler(
          app,
        );

        app.post(
          '/test',
          {
            schema: {
              body: {
                type:
                  'object',

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

          async () => ({
            ok:
              true,
          }),
        );

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/test',

            payload:
              {},
          });

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_INPUT',

          message:
            'Os dados enviados são inválidos.',
        });

        await app.close();
      },
    );

    it(
      'returns 400 for InvalidValueError',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        registerApiErrorHandler(
          app,
        );

        app.get(
          '/test',
          async () => {
            throw new InvalidValueError(
              'internal validation detail',
            );
          },
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/test',
          });

        expect(
          response.statusCode,
        ).toBe(400);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_INPUT',

          message:
            'Os dados enviados são inválidos.',
        });

        expect(
          response.body,
        ).not.toContain(
          'internal validation detail',
        );

        await app.close();
      },
    );

    it(
      'returns 409 for duplicate category name',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        registerApiErrorHandler(
          app,
        );

        app.get(
          '/test',
          async () => {
            throw new CategoryNameAlreadyExistsError();
          },
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/test',
          });

        expect(
          response.statusCode,
        ).toBe(409);

        expect(
          response.json(),
        ).toEqual({
          code:
            'CATEGORY_NAME_ALREADY_EXISTS',

          message:
            'Já existe uma categoria com este nome.',
        });

        await app.close();
      },
    );

    it(
      'returns 409 without revealing why a product category is unavailable',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        registerApiErrorHandler(
          app,
        );

        app.get(
          '/test',
          async () => {
            throw new ProductCategoryNotAvailableError();
          },
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/test',
          });

        expect(
          response.statusCode,
        ).toBe(409);

        expect(
          response.json(),
        ).toEqual({
          code:
            'PRODUCT_CATEGORY_NOT_AVAILABLE',

          message:
            'A categoria selecionada não está disponível.',
        });

        expect(
          response.body,
        ).not.toContain(
          'archived',
        );

        expect(
          response.body,
        ).not.toContain(
          'tenant',
        );

        await app.close();
      },
    );

    it(
      'returns 409 for duplicate product SKU',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        registerApiErrorHandler(
          app,
        );

        app.get(
          '/test',
          async () => {
            throw new ProductSkuAlreadyExistsError();
          },
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/test',
          });

        expect(
          response.statusCode,
        ).toBe(409);

        expect(
          response.json(),
        ).toEqual({
          code:
            'PRODUCT_SKU_ALREADY_EXISTS',

          message:
            'Já existe um produto com este SKU.',
        });

        await app.close();
      },
    );

    it(
      'returns generic 500 without leaking internal details',
      async () => {
        const app =
          Fastify({
            logger:
              false,
          });

        const logger =
          createLogger();

        registerApiErrorHandler(
          app,
          logger,
        );

        app.get(
          '/test',
          async () => {
            throw new Error(
              'password=secret database exploded',
            );
          },
        );

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/test',
          });

        expect(
          response.statusCode,
        ).toBe(500);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INTERNAL_ERROR',

          message:
            'Ocorreu um erro interno.',
        });

        expect(
          response.body,
        ).not.toContain(
          'password=secret',
        );

        expect(
          response.body,
        ).not.toContain(
          'database exploded',
        );

        expect(
          logger.error,
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            event:
              'api.request.failed',
          }),
        );

        await app.close();
      },
    );
  },
);