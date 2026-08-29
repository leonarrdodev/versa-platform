import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ListAvailableTenantsHandler,
} from '../src/index.js';

import type {
  TenantSelectionRepository,
} from '../src/index.js';

const USER_ID =
  '22222222-2222-4222-8222-222222222222';

describe(
  'ListAvailableTenantsHandler',
  () => {
    it(
      'returns active tenants available to the user',
      async () => {
        const tenants = [
          {
            id:
              '33333333-3333-4333-8333-333333333333',

            name:
              'Empresa A',

            role:
              'owner' as const,
          },

          {
            id:
              '44444444-4444-4444-8444-444444444444',

            name:
              'Empresa B',

            role:
              'admin' as const,
          },
        ];

        const listAvailableTenants =
          vi.fn()
            .mockResolvedValue(
              tenants,
            );

        const repository = {
          listAvailableTenants,

          setActiveTenant:
            vi.fn(),
        } as unknown as
          TenantSelectionRepository;

        const handler =
          new ListAvailableTenantsHandler({
            repository,
          });

        const result =
          await handler.execute({
            userId:
              USER_ID,
          });

        expect(
          listAvailableTenants,
        ).toHaveBeenCalledWith(
          USER_ID,
        );

        expect(
          result,
        ).toEqual(
          tenants,
        );
      },
    );
  },
);