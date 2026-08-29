import {
  ActiveTenantNotAllowedError,
  InvalidCredentialsError,
  InvalidSessionError,
} from '@versa/identity';

import type {
  ListAvailableTenantsHandler,
  ResolveSessionHandler,
  RevokeSessionHandler,
  SetActiveTenantHandler,
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

const SECOND_TENANT_ID =
  '44444444-4444-4444-8444-444444444444';

const SESSION_ID =
  '33333333-3333-4333-8333-333333333333';

const SESSION_TOKEN =
  'v1.super-secret-session-token';

const EXPIRES_AT =
  '2026-09-01T21:00:00.000Z';

const CURRENT_SESSION = {
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

    name:
      'Versa Wear',

    role:
      'owner' as const,
  },

  expiresAt:
    EXPIRES_AT,
};

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
      .mockResolvedValue(
        CURRENT_SESSION,
      );

  const revokeSessionExecute =
    vi.fn()
      .mockResolvedValue(
        undefined,
      );

  const listAvailableTenantsExecute =
    vi.fn()
      .mockResolvedValue([
        {
          id:
            TENANT_ID,

          name:
            'Versa Wear',

          role:
            'owner',
        },

        {
          id:
            SECOND_TENANT_ID,

          name:
            'Empresa B',

          role:
            'admin',
        },
      ]);

  const setActiveTenantExecute =
    vi.fn()
      .mockResolvedValue(
        undefined,
      );

  return {
    signInExecute,
    resolveSessionExecute,
    revokeSessionExecute,
    listAvailableTenantsExecute,
    setActiveTenantExecute,

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

      listAvailableTenantsHandler: {
        execute:
          listAvailableTenantsExecute,
      } as unknown as ListAvailableTenantsHandler,

      setActiveTenantHandler: {
        execute:
          setActiveTenantExecute,
      } as unknown as SetActiveTenantHandler,

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
        ).toEqual(
          CURRENT_SESSION,
        );

        await app.close();
      },
    );

    it(
      'lists tenants available to the authenticated user',
      async () => {
        const {
          identity,
          resolveSessionExecute,
          listAvailableTenantsExecute,
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
              '/auth/tenants',

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
          listAvailableTenantsExecute,
        ).toHaveBeenCalledWith({
          userId:
            USER_ID,
        });

        expect(
          response.json(),
        ).toEqual({
          tenants: [
            {
              id:
                TENANT_ID,

              name:
                'Versa Wear',

              role:
                'owner',
            },

            {
              id:
                SECOND_TENANT_ID,

              name:
                'Empresa B',

              role:
                'admin',
            },
          ],
        });

        await app.close();
      },
    );

    it(
      'changes the active tenant of the current session',
      async () => {
        const {
          identity,
          resolveSessionExecute,
          setActiveTenantExecute,
        } =
          createIdentityMocks();

        const updatedSession = {
          ...CURRENT_SESSION,

          activeTenant: {
            id:
              SECOND_TENANT_ID,

            name:
              'Empresa B',

            role:
              'admin' as const,
          },
        };

        resolveSessionExecute
          .mockResolvedValueOnce(
            CURRENT_SESSION,
          )
          .mockResolvedValueOnce(
            updatedSession,
          );

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
              '/auth/active-tenant',

            headers: {
              cookie:
                `versa_session=${SESSION_TOKEN}`,
            },

            payload: {
              tenantId:
                SECOND_TENANT_ID,
            },
          });

        expect(
          response.statusCode,
        ).toBe(200);

        expect(
          setActiveTenantExecute,
        ).toHaveBeenCalledWith({
          sessionId:
            SESSION_ID,

          userId:
            USER_ID,

          tenantId:
            SECOND_TENANT_ID,
        });

        /*
         * Uma resolução antes da troca
         * e outra depois.
         */
        expect(
          resolveSessionExecute,
        ).toHaveBeenCalledTimes(
          2,
        );

        expect(
          response.json(),
        ).toEqual(
          updatedSession,
        );

        await app.close();
      },
    );

    it(
      'returns 403 when the selected tenant is not available to the user',
      async () => {
        const {
          identity,
        } =
          createIdentityMocks();

        const setActiveTenantHandler = {
          execute:
            vi.fn()
              .mockRejectedValue(
                new ActiveTenantNotAllowedError(),
              ),
        } as unknown as
          SetActiveTenantHandler;

        const app =
          buildApp({
            logger:
              false,

            identity: {
              ...identity,
              setActiveTenantHandler,
            },
          });

        const response =
          await app.inject({
            method:
              'POST',

            url:
              '/auth/active-tenant',

            headers: {
              cookie:
                `versa_session=${SESSION_TOKEN}`,
            },

            payload: {
              tenantId:
                SECOND_TENANT_ID,
            },
          });

        expect(
          response.statusCode,
        ).toBe(403);

        expect(
          response.json(),
        ).toEqual({
          code:
            'ACTIVE_TENANT_NOT_ALLOWED',

          message:
            'A empresa selecionada não está disponível para esta sessão.',
        });

        await app.close();
      },
    );

    it(
      'returns 400 when active tenant body is invalid',
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
              '/auth/active-tenant',

            headers: {
              cookie:
                `versa_session=${SESSION_TOKEN}`,
            },

            payload: {},
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
        } as unknown as
          SignInHandler;

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
        } as unknown as
          ResolveSessionHandler;

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