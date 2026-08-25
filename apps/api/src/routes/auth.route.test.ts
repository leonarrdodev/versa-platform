import {
  InvalidCredentialsError,
  InvalidSessionError,
} from '@versa/identity';

import type {
  ResolveSessionHandler,
  RevokeSessionHandler,
  SignInHandler,
} from '@versa/identity';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  buildApp,
} from '../app.js';

const USER_ID =
  '11111111-1111-4111-8111-111111111111';

const TENANT_ID =
  '22222222-2222-4222-8222-222222222222';

const SESSION_ID =
  '33333333-3333-4333-8333-333333333333';

const SESSION_TOKEN =
  'v1.super-secret-session-token';

const EXPIRES_AT =
  '2026-09-01T21:00:00.000Z';

function getSetCookieHeader(
  value:
    string
    | string[]
    | undefined,
): string {
  if (
    value === undefined
  ) {
    throw new Error(
      'Expected Set-Cookie header',
    );
  }

  return Array.isArray(value)
    ? value.join('; ')
    : value;
}

function createIdentityMocks() {
  const signInExecute =
    vi.fn()
      .mockResolvedValue({
        userId:
          USER_ID,

        email:
          'leo@example.com',

        displayName:
          'Leonardo',

        memberships: [
          {
            tenantId:
              TENANT_ID,

            role:
              'owner',
          },
        ],

        session: {
          id:
            SESSION_ID,

          token:
            SESSION_TOKEN,

          activeTenantId:
            TENANT_ID,

          expiresAt:
            EXPIRES_AT,
        },
      });

  const resolveSessionExecute =
    vi.fn()
      .mockResolvedValue({
        sessionId:
          SESSION_ID,

        user: {
          id:
            USER_ID,

          email:
            'leo@example.com',

          displayName:
            'Leonardo',
        },

        activeTenant: {
          id:
            TENANT_ID,

          role:
            'owner',
        },

        expiresAt:
          EXPIRES_AT,
      });

  const revokeSessionExecute =
    vi.fn()
      .mockResolvedValue(
        undefined,
      );

  return {
    signInExecute,
    resolveSessionExecute,
    revokeSessionExecute,

    identity: {
      signInHandler: {
        execute:
          signInExecute,
      } as unknown as SignInHandler,

      resolveSessionHandler: {
        execute:
          resolveSessionExecute,
      } as unknown as ResolveSessionHandler,

      revokeSessionHandler: {
        execute:
          revokeSessionExecute,
      } as unknown as RevokeSessionHandler,

      secureCookies:
        false,
    },
  };
}

describe(
  'Auth HTTP routes',
  () => {
    it(
      'logs in and stores the session token only in an HttpOnly cookie',
      async () => {
        const {
          identity,
          signInExecute,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity,
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/login',

            payload: {
              email:
                'leo@example.com',

              password:
                'uma senha longa e segura',
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          signInExecute,
        ).toHaveBeenCalledWith({
          email:
            'leo@example.com',

          password:
            'uma senha longa e segura',
        });

        const setCookie =
          getSetCookieHeader(
            response.headers[
              'set-cookie'
            ],
          );

        expect(
          setCookie,
        ).toContain(
          `versa_session=${SESSION_TOKEN}`,
        );

        expect(
          setCookie,
        ).toContain(
          'HttpOnly',
        );

        expect(
          setCookie,
        ).toContain(
          'SameSite=Lax',
        );

        expect(
          setCookie,
        ).toContain(
          'Path=/',
        );

        /*
         * Desenvolvimento local:
         * Secure=false.
         */
        expect(
          setCookie,
        ).not.toContain(
          'Secure',
        );

        const body =
          response.json();

        expect(body).toEqual({
          user: {
            id:
              USER_ID,

            email:
              'leo@example.com',

            displayName:
              'Leonardo',
          },

          memberships: [
            {
              tenantId:
                TENANT_ID,

              role:
                'owner',
            },
          ],

          session: {
            id:
              SESSION_ID,

            activeTenantId:
              TENANT_ID,

            expiresAt:
              EXPIRES_AT,
          },
        });

        /*
         * O segredo da sessão não pode
         * vazar para o JSON.
         */
        expect(
          response.body,
        ).not.toContain(
          SESSION_TOKEN,
        );

        await app.close();
      },
    );

    it(
      'enables Secure cookies in production mode',
      async () => {
        const {
          identity,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity: {
              ...identity,

              secureCookies:
                true,
            },
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/login',

            payload: {
              email:
                'leo@example.com',

              password:
                'uma senha longa e segura',
            },
          });

        const setCookie =
          getSetCookieHeader(
            response.headers[
              'set-cookie'
            ],
          );

        expect(
          setCookie,
        ).toContain(
          'Secure',
        );

        await app.close();
      },
    );

    it(
      'resolves the current session from the cookie',
      async () => {
        const {
          identity,
          resolveSessionExecute,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity,
          });

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/auth/session',

            headers: {
              cookie:
                `versa_session=${SESSION_TOKEN}`,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          resolveSessionExecute,
        ).toHaveBeenCalledWith(
          SESSION_TOKEN,
        );

        expect(
          response.json(),
        ).toEqual({
          sessionId:
            SESSION_ID,

          user: {
            id:
              USER_ID,

            email:
              'leo@example.com',

            displayName:
              'Leonardo',
          },

          activeTenant: {
            id:
              TENANT_ID,

            role:
              'owner',
          },

          expiresAt:
            EXPIRES_AT,
        });

        await app.close();
      },
    );

    it(
      'revokes the current session and clears the cookie on logout',
      async () => {
        const {
          identity,
          revokeSessionExecute,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity,
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/logout',

            headers: {
              cookie:
                `versa_session=${SESSION_TOKEN}`,
            },
          });

        expect(
          response.statusCode,
        ).toBe(204);

        expect(
          revokeSessionExecute,
        ).toHaveBeenCalledWith(
          SESSION_TOKEN,
        );

        const setCookie =
          getSetCookieHeader(
            response.headers[
              'set-cookie'
            ],
          );

        expect(
          setCookie,
        ).toContain(
          'versa_session=',
        );

        expect(
          setCookie,
        ).toContain(
          'Path=/',
        );

        await app.close();
      },
    );

    it(
      'treats logout without a cookie as successful',
      async () => {
        const {
          identity,
          revokeSessionExecute,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity,
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/logout',
          });

        expect(
          response.statusCode,
        ).toBe(204);

        expect(
          revokeSessionExecute,
        ).toHaveBeenCalledWith(
          '',
        );

        await app.close();
      },
    );

    it(
      'returns 401 for invalid credentials',
      async () => {
        const {
          identity,
        } =
          createIdentityMocks();

        const signInHandler = {
          execute:
            vi.fn()
              .mockRejectedValue(
                new InvalidCredentialsError(),
              ),
        } as unknown as SignInHandler;

        const app =
          buildApp({
            logger:
              false,

            identity: {
              ...identity,
              signInHandler,
            },
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/login',

            payload: {
              email:
                'missing@example.com',

              password:
                'wrong-password',
            },
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_CREDENTIALS',

          message:
            'E-mail ou senha inválidos.',
        });

        await app.close();
      },
    );

    it(
      'returns 401 for an invalid or missing session',
      async () => {
        const {
          identity,
        } =
          createIdentityMocks();

        const resolveSessionHandler = {
          execute:
            vi.fn()
              .mockRejectedValue(
                new InvalidSessionError(),
              ),
        } as unknown as ResolveSessionHandler;

        const app =
          buildApp({
            logger:
              false,

            identity: {
              ...identity,
              resolveSessionHandler,
            },
          });

        const response =
          await app.inject({
            method:
              'GET',

            url:
              '/auth/session',
          });

        expect(
          response.statusCode,
        ).toBe(401);

        expect(
          response.json(),
        ).toEqual({
          code:
            'INVALID_SESSION',

          message:
            'Sessão inválida ou expirada.',
        });

        await app.close();
      },
    );

    it(
      'returns 400 when login body is invalid',
      async () => {
        const {
          identity,
        } =
          createIdentityMocks();

        const app =
          buildApp({
            logger:
              false,

            identity,
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/login',

            payload: {
              email:
                'leo@example.com',
            },
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
  },
);