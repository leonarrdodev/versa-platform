import type {
  ResolveSessionHandler,
  RevokeSessionHandler,
  SignInHandler,
} from '@versa/identity';

import type {
  FastifyPluginAsync,
} from 'fastify';

const SESSION_COOKIE_NAME =
  'versa_session';

interface LoginBody {
  readonly email:
    string;

  readonly password:
    string;
}

export interface AuthRouteDependencies {
  readonly signInHandler:
    SignInHandler;

  readonly resolveSessionHandler:
    ResolveSessionHandler;

  readonly revokeSessionHandler:
    RevokeSessionHandler;

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
          .send(session);
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