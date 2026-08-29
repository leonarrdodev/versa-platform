import type {
  ListAvailableTenantsHandler,
  ResolveSessionHandler,
  RevokeSessionHandler,
  SetActiveTenantHandler,
  SignInHandler,
} from '@versa/identity';

import type {
  FastifyPluginAsync,
} from 'fastify';

import {
  SESSION_COOKIE_NAME,
} from '../auth/session-cookie.js';

interface LoginBody {
  readonly email:
    string;

  readonly password:
    string;
}

interface SetActiveTenantBody {
  readonly tenantId:
    string;
}

export interface AuthRouteDependencies {
  readonly signInHandler:
    SignInHandler;

  readonly resolveSessionHandler:
    ResolveSessionHandler;

  readonly revokeSessionHandler:
    RevokeSessionHandler;

  readonly listAvailableTenantsHandler:
    ListAvailableTenantsHandler;

  readonly setActiveTenantHandler:
    SetActiveTenantHandler;

  readonly secureCookies:
    boolean;
}

export function createAuthRoute(
  dependencies:
    AuthRouteDependencies,
): FastifyPluginAsync {
  return async function authRoute(
    app,
  ): Promise<void> {
    app.post<{
      Body:
        LoginBody;
    }>(
      '/auth/login',
      {
        schema: {
          body: {
            type:
              'object',

            additionalProperties:
              false,

            required: [
              'email',
              'password',
            ],

            properties: {
              email: {
                type:
                  'string',
              },

              password: {
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
        const result =
          await dependencies
            .signInHandler
            .execute({
              email:
                request.body.email,

              password:
                request.body.password,
            });

        reply.setCookie(
          SESSION_COOKIE_NAME,
          result.session.token,
          {
            httpOnly:
              true,

            sameSite:
              'lax',

            secure:
              dependencies
                .secureCookies,

            path:
              '/',

            expires:
              new Date(
                result.session
                  .expiresAt,
              ),
          },
        );

        /*
         * O token secreto NÃO entra
         * no JSON da resposta.
         */
        return reply
          .code(200)
          .send({
            user: {
              id:
                result.userId,

              email:
                result.email,

              displayName:
                result.displayName,
            },

            memberships:
              result.memberships,

            session: {
              id:
                result.session.id,

              activeTenantId:
                result.session
                  .activeTenantId,

              expiresAt:
                result.session
                  .expiresAt,
            },
          });
      },
    );

    app.get(
      '/auth/session',

      async (
        request,
        reply,
      ) => {
        const token =
          request.cookies[
            SESSION_COOKIE_NAME
          ] ?? '';

        const session =
          await dependencies
            .resolveSessionHandler
            .execute(
              token,
            );

        return reply
          .code(200)
          .send(
            session,
          );
      },
    );

    /*
     * Lista somente empresas
     * atualmente disponíveis para
     * o usuário autenticado.
     */
    app.get(
      '/auth/tenants',

      async (
        request,
        reply,
      ) => {
        const token =
          request.cookies[
            SESSION_COOKIE_NAME
          ] ?? '';

        const session =
          await dependencies
            .resolveSessionHandler
            .execute(
              token,
            );

        const tenants =
          await dependencies
            .listAvailableTenantsHandler
            .execute({
              userId:
                session.user.id,
            });

        return reply
          .code(200)
          .send({
            tenants,
          });
      },
    );

    /*
     * Troca o contexto empresarial
     * da sessão atual.
     *
     * O tenantId enviado pelo cliente
     * nunca é confiado diretamente.
     * O Identity valida membership,
     * tenant e propriedade da sessão.
     */
    app.post<{
      Body:
        SetActiveTenantBody;
    }>(
      '/auth/active-tenant',
      {
        schema: {
          body: {
            type:
              'object',

            additionalProperties:
              false,

            required: [
              'tenantId',
            ],

            properties: {
              tenantId: {
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
        const token =
          request.cookies[
            SESSION_COOKIE_NAME
          ] ?? '';

        const currentSession =
          await dependencies
            .resolveSessionHandler
            .execute(
              token,
            );

        await dependencies
          .setActiveTenantHandler
          .execute({
            sessionId:
              currentSession
                .sessionId,

            userId:
              currentSession
                .user.id,

            tenantId:
              request.body
                .tenantId,
          });

        /*
         * Re-resolvemos a mesma
         * sessão depois do UPDATE.
         *
         * Assim o frontend já recebe
         * o contexto novo completo,
         * inclusive nome e papel.
         */
        const updatedSession =
          await dependencies
            .resolveSessionHandler
            .execute(
              token,
            );

        return reply
          .code(200)
          .send(
            updatedSession,
          );
      },
    );

    app.post(
      '/auth/logout',

      async (
        request,
        reply,
      ) => {
        const token =
          request.cookies[
            SESSION_COOKIE_NAME
          ] ?? '';

        await dependencies
          .revokeSessionHandler
          .execute(
            token,
          );

        reply.clearCookie(
          SESSION_COOKIE_NAME,
          {
            path:
              '/',
          },
        );

        return reply
          .code(204)
          .send();
      },
    );
  };
}