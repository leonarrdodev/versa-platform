import type {
  FastifyRequest,
} from 'fastify';

import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  ActiveTenantRequiredError,
} from './active-tenant-required-error.js';

import {
  getRequiredActiveTenantId,
} from './get-required-active-tenant-id.js';

describe(
  'getRequiredActiveTenantId',
  () => {
    it(
      'returns the tenant from the authenticated request',
      () => {
        const request = {
          auth: {
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
                'owner',
            },

            expiresAt:
              '2026-09-01T21:00:00.000Z',
          },
        } as unknown as FastifyRequest;

        expect(
          getRequiredActiveTenantId(
            request,
          ),
        ).toBe(
          '33333333-3333-4333-8333-333333333333',
        );
      },
    );

    it(
      'rejects an authenticated request without an active tenant',
      () => {
        const request = {
          auth: {
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

            activeTenant:
              null,

            expiresAt:
              '2026-09-01T21:00:00.000Z',
          },
        } as unknown as FastifyRequest;

        expect(
          () =>
            getRequiredActiveTenantId(
              request,
            ),
        ).toThrow(
          ActiveTenantRequiredError,
        );
      },
    );
  },
);