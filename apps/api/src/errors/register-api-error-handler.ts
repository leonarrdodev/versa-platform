import {
  ProductSkuAlreadyExistsError,
} from '@versa/catalog';

import {
  ActiveTenantNotAllowedError,
  InvalidCredentialsError,
  InvalidSessionError,
} from '@versa/identity';

import type {
  Logger,
} from '@versa/observability';

import {
  InvalidValueError,
} from '@versa/shared-kernel';

import type {
  FastifyInstance,
} from 'fastify';

import {
  ActiveTenantRequiredError,
} from '../auth/active-tenant-required-error.js';

interface ErrorWithValidation {
  readonly validation:
    unknown;
}

function isFastifyValidationError(
  error:
    unknown,
): error is ErrorWithValidation {
  return (
    typeof error ===
      'object'
    &&
    error !==
      null
    &&
    'validation' in
      error
  );
}

export function registerApiErrorHandler(
  app:
    FastifyInstance,

  logger?:
    Logger,
): void {
  app.setErrorHandler(
    (
      error,
      request,
      reply,
    ) => {
      /*
       * Erros produzidos pela
       * validação de schema do
       * próprio Fastify.
       */
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

      /*
       * Value Objects e regras de
       * entrada inválida do domínio.
       */
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

      /*
       * Credenciais inválidas não
       * revelam se o problema foi
       * email ou senha.
       */
      if (
        error instanceof
          InvalidCredentialsError
      ) {
        return reply
          .code(401)
          .send({
            code:
              'INVALID_CREDENTIALS',

            message:
              'E-mail ou senha inválidos.',
          });
      }

      /*
       * Cookie ausente, sessão
       * desconhecida, adulterada,
       * expirada, revogada ou com
       * identidade atualmente
       * indisponível.
       */
      if (
        error instanceof
          InvalidSessionError
      ) {
        return reply
          .code(401)
          .send({
            code:
              'INVALID_SESSION',

            message:
              'Sessão inválida ou expirada.',
          });
      }

      /*
       * Usuário autenticado tentou
       * selecionar uma empresa que
       * não está disponível para
       * esta sessão.
       *
       * Não revelamos se a empresa
       * existe, está suspensa ou se
       * simplesmente não pertence
       * ao usuário.
       */
      if (
        error instanceof
          ActiveTenantNotAllowedError
      ) {
        return reply
          .code(403)
          .send({
            code:
              'ACTIVE_TENANT_NOT_ALLOWED',

            message:
              'A empresa selecionada não está disponível para esta sessão.',
          });
      }

      /*
       * Usuário autenticado, mas sem
       * uma empresa ativa selecionada.
       */
      if (
        error instanceof
          ActiveTenantRequiredError
      ) {
        return reply
          .code(403)
          .send({
            code:
              'ACTIVE_TENANT_REQUIRED',

            message:
              'Selecione uma empresa para continuar.',
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

      /*
       * Qualquer erro que chegou aqui
       * é inesperado.
       */
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