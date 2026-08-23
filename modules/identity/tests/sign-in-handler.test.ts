import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  SignInHandler,
} from '../src/index.js';

import type {
  CreateSessionHandler,
  LoginHandler,
} from '../src/index.js';

const USER_ID =
  '11111111-1111-4111-8111-111111111111';

const TENANT_ID =
  '22222222-2222-4222-8222-222222222222';

describe('SignInHandler', () => {
  it('authenticates and creates a session for the only active tenant', async () => {
    const loginExecute =
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
        });

    const createSessionExecute =
      vi.fn()
        .mockResolvedValue({
          sessionId:
            '33333333-3333-4333-8333-333333333333',

          token:
            'v1.session-secret',

          userId:
            USER_ID,

          activeTenantId:
            TENANT_ID,

          expiresAt:
            '2026-08-30T17:00:00.000Z',
        });

    const handler =
      new SignInHandler({
        loginHandler: {
          execute:
            loginExecute,
        } as unknown as LoginHandler,

        createSessionHandler: {
          execute:
            createSessionExecute,
        } as unknown as CreateSessionHandler,
      });

    const result =
      await handler.execute({
        email:
          'leo@example.com',

        password:
          'uma senha longa e segura',
      });

    expect(
      loginExecute,
    ).toHaveBeenCalledOnce();

    expect(
      createSessionExecute,
    ).toHaveBeenCalledWith({
      userId:
        USER_ID,

      activeTenantId:
        TENANT_ID,
    });

    expect(result).toEqual({
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
          '33333333-3333-4333-8333-333333333333',

        token:
          'v1.session-secret',

        activeTenantId:
          TENANT_ID,

        expiresAt:
          '2026-08-30T17:00:00.000Z',
      },
    });
  });

  it('creates a session without active tenant when multiple memberships are available', async () => {
    const loginHandler = {
      execute:
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

              {
                tenantId:
                  '44444444-4444-4444-8444-444444444444',

                role:
                  'admin',
              },
            ],
          }),
    } as unknown as LoginHandler;

    const createSessionExecute =
      vi.fn()
        .mockResolvedValue({
          sessionId:
            '33333333-3333-4333-8333-333333333333',

          token:
            'v1.session-secret',

          userId:
            USER_ID,

          activeTenantId:
            null,

          expiresAt:
            '2026-08-30T17:00:00.000Z',
        });

    const handler =
      new SignInHandler({
        loginHandler,

        createSessionHandler: {
          execute:
            createSessionExecute,
        } as unknown as CreateSessionHandler,
      });

    await handler.execute({
      email:
        'leo@example.com',

      password:
        'uma senha longa e segura',
    });

    expect(
      createSessionExecute,
    ).toHaveBeenCalledWith({
      userId:
        USER_ID,

      activeTenantId:
        null,
    });
  });

  it('does not create a session when authentication fails', async () => {
    const failure =
      new Error(
        'Invalid credentials',
      );

    const loginHandler = {
      execute:
        vi.fn()
          .mockRejectedValue(
            failure,
          ),
    } as unknown as LoginHandler;

    const createSessionExecute =
      vi.fn();

    const handler =
      new SignInHandler({
        loginHandler,

        createSessionHandler: {
          execute:
            createSessionExecute,
        } as unknown as CreateSessionHandler,
      });

    await expect(
      handler.execute({
        email:
          'leo@example.com',

        password:
          'wrong-password',
      }),
    ).rejects.toBe(
      failure,
    );

    expect(
      createSessionExecute,
    ).not.toHaveBeenCalled();
  });
});