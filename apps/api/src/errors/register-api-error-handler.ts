import {
  ProductSkuAlreadyExistsError,
} from '@versa/catalog';

import type {
  Logger,
} from '@versa/observability';

import {
  InvalidValueError,
} from '@versa/shared-kernel';

import type {
  FastifyInstance,
} from 'fastify';

interface ErrorWithValidation {
  readonly validation: unknown;
}

function isFastifyValidationError(
  error: unknown,
): error is ErrorWithValidation {
  return (
    typeof error === 'object' &&
    error !== null &&
    'validation' in error
  );
}

export function registerApiErrorHandler(
  app: FastifyInstance,
  logger?: Logger,
): void {
  app.setErrorHandler(
    (
      error,
      request,
      reply,
    ) => {
      if (
        isFastifyValidationError(
          error,
        )
      ) {
        return reply
          .code(400)
          .send({
            code:
              'INVALID_INPUT',

            message:
              'Os dados enviados são inválidos.',
          });
      }

      if (
        error instanceof
        InvalidValueError
      ) {
        return reply
          .code(400)
          .send({
            code:
              'INVALID_INPUT',

            message:
              'Os dados enviados são inválidos.',
          });
      }

      if (
        error instanceof
        ProductSkuAlreadyExistsError
      ) {
        return reply
          .code(409)
          .send({
            code:
              'PRODUCT_SKU_ALREADY_EXISTS',

            message:
              'Já existe um produto com este SKU.',
          });
      }

      logger?.error({
        message:
          'Unhandled API error',

        event:
          'api.request.failed',

        error,

        data: {
          method:
            request.method,

          url:
            request.url,
        },
      });

      return reply
        .code(500)
        .send({
          code:
            'INTERNAL_ERROR',

          message:
            'Ocorreu um erro interno.',
        });
    },
  );
}