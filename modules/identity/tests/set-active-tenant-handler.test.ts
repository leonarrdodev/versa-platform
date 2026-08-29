import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  ActiveTenantNotAllowedError,
  SetActiveTenantHandler,
} from '../src/index.js';

import type {
  TenantSelectionRepository,
} from '../src/index.js';

const SESSION_ID =
  '11111111-1111-4111-8111-111111111111';

const USER_ID =
  '22222222-2222-4222-8222-222222222222';

const TENANT_ID =
  '33333333-3333-4333-8333-333333333333';

function createRepository(
  updated:
    boolean,
): {
  repository:
    TenantSelectionRepository;

  setActiveTenant:
    ReturnType<
      typeof vi.fn
    >;
} {
  const setActiveTenant =
    vi.fn()
      .mockResolvedValue(
        updated,
      );

  const repository = {
    listAvailableTenants:
      vi.fn(),

    setActiveTenant,
  } as unknown as
    TenantSelectionRepository;

  return {
    repository,
    setActiveTenant,
  };
}

describe(
  'SetActiveTenantHandler',
  () => {
    it(
      'selects a tenant available to the authenticated user',
      async () => {
        const {
          repository,
          setActiveTenant,
        } =
          createRepository(
            true,
          );

        const handler =
          new SetActiveTenantHandler({
            repository,
          });

        await handler.execute({
          sessionId:
            SESSION_ID,

          userId:
            USER_ID,

          tenantId:
            TENANT_ID,
        });

        expect(
          setActiveTenant,
        ).toHaveBeenCalledWith({
          sessionId:
            SESSION_ID,

          userId:
            USER_ID,

          tenantId:
            TENANT_ID,
        });
      },
    );

    it(
      'rejects a tenant unavailable to the authenticated user',
      async () => {
        const {
          repository,
        } =
          createRepository(
            false,
          );

        const handler =
          new SetActiveTenantHandler({
            repository,
          });

        await expect(
          handler.execute({
            sessionId:
              SESSION_ID,

            userId:
              USER_ID,

            tenantId:
              TENANT_ID,
          }),
        ).rejects.toBeInstanceOf(
          ActiveTenantNotAllowedError,
        );
      },
    );

    it(
      'rejects an invalid tenant identifier before accessing the repository',
      async () => {
        const {
          repository,
          setActiveTenant,
        } =
          createRepository(
            true,
          );

        const handler =
          new SetActiveTenantHandler({
            repository,
          });

        await expect(
          handler.execute({
            sessionId:
              SESSION_ID,

            userId:
              USER_ID,

            tenantId:
              'not-a-uuid',
          }),
        ).rejects.toThrow();

        expect(
          setActiveTenant,
        ).not.toHaveBeenCalled();
      },
    );
  },
);