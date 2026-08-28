import {
  InvalidSessionError,
} from '@versa/identity';

import type {
  ResolveSessionHandler,
} from '@versa/identity';

import type {
  FastifyRequest,
} from 'fastify';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  createRequireAuthentication,
} from './require-authentication.js';

const SESSION_RESULT = {
  sessionId:
    '11111111-1111-4111-8111-111111111111',

  user: {
    id:
      '22222222-2222-4222-8222-222222222222',

    email:
      'leo@example.com',

    displayName:
      'Leonardo',
  },

  activeTenant: {
    id:
      '33333333-3333-4333-8333-333333333333',

    role:
      'owner' as const,
  },

  expiresAt:
    '2026-09-01T21:00:00.000Z',
};

describe(
  'requireAuthentication',
  () => {
    it(
      'resolves the cookie and attaches authentication to the request',
      async () => {
        const execute =
          vi.fn()
            .mockResolvedValue(
              SESSION_RESULT,
            );

        const hook =
          createRequireAuthentication({
            resolveSessionHandler: {
              execute,
            } as unknown as ResolveSessionHandler,
          });

        const request = {
          cookies: {
            versa_session:
              'v1.secret-token',
          },

          auth:
            null,
        } as unknown as FastifyRequest;

        await hook(
          request,
        );

        expect(
          execute,
        ).toHaveBeenCalledWith(
          'v1.secret-token',
        );

        expect(
          request.auth,
        ).toEqual(
          SESSION_RESULT,
        );
      },
    );

    it(
      'passes an empty token when the cookie is missing',
      async () => {
        const error =
          new InvalidSessionError();

        const execute =
          vi.fn()
            .mockRejectedValue(
              error,
            );

        const hook =
          createRequireAuthentication({
            resolveSessionHandler: {
              execute,
            } as unknown as ResolveSessionHandler,
          });

        const request = {
          cookies: {},

          auth:
            null,
        } as unknown as FastifyRequest;

        await expect(
          hook(
            request,
          ),
        ).rejects.toBe(
          error,
        );

        expect(
          execute,
        ).toHaveBeenCalledWith(
          '',
        );

        expect(
          request.auth,
        ).toBeNull();
      },
    );
  },
);