import type {
  Pool,
  PoolClient,
} from 'pg';

import {
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  PostgresIdentityUnitOfWork,
  PostgresTenantMembershipRepository,
  PostgresTenantRepository,
  PostgresUserRepository,
} from '../src/index.js';

function createDatabaseMock(): {
  readonly pool: Pool;

  readonly query: ReturnType<
    typeof vi.fn
  >;

  readonly release: ReturnType<
    typeof vi.fn
  >;
} {
  const query = vi
    .fn()
    .mockResolvedValue({
      rows: [],
      rowCount: null,
    });

  const release = vi.fn();

  const client = {
    query,
    release,
  } as unknown as PoolClient;

  const connect = vi
    .fn()
    .mockResolvedValue(
      client,
    );

  const pool = {
    connect,
  } as unknown as Pool;

  return {
    pool,
    query,
    release,
  };
}

describe('PostgresIdentityUnitOfWork', () => {
  it('commits the transaction after successful work', async () => {
    const {
      pool,
      query,
      release,
    } = createDatabaseMock();

    const unitOfWork =
      new PostgresIdentityUnitOfWork(
        pool,
      );

    const result =
      await unitOfWork.execute(
        async (transaction) => {
          expect(
            transaction.users,
          ).toBeInstanceOf(
            PostgresUserRepository,
          );

          expect(
            transaction.tenants,
          ).toBeInstanceOf(
            PostgresTenantRepository,
          );

          expect(
            transaction.memberships,
          ).toBeInstanceOf(
            PostgresTenantMembershipRepository,
          );

          return 'completed';
        },
      );

    expect(result).toBe(
      'completed',
    );

    expect(
      query.mock.calls.map(
        (call) => call[0],
      ),
    ).toEqual([
      'BEGIN',
      'COMMIT',
    ]);

    expect(
      release,
    ).toHaveBeenCalledOnce();
  });

  it('rolls back when the work fails', async () => {
    const {
      pool,
      query,
      release,
    } = createDatabaseMock();

    const unitOfWork =
      new PostgresIdentityUnitOfWork(
        pool,
      );

    const failure =
      new Error(
        'Persistence failed',
      );

    await expect(
      unitOfWork.execute(
        async () => {
          throw failure;
        },
      ),
    ).rejects.toBe(
      failure,
    );

    expect(
      query.mock.calls.map(
        (call) => call[0],
      ),
    ).toEqual([
      'BEGIN',
      'ROLLBACK',
    ]);

    expect(
      release,
    ).toHaveBeenCalledOnce();
  });

  it('releases the client even when rollback finishes after a failure', async () => {
    const {
      pool,
      release,
    } = createDatabaseMock();

    const unitOfWork =
      new PostgresIdentityUnitOfWork(
        pool,
      );

    await expect(
      unitOfWork.execute(
        async () => {
          throw new Error(
            'Failure',
          );
        },
      ),
    ).rejects.toThrow(
      'Failure',
    );

    expect(
      release,
    ).toHaveBeenCalledOnce();
  });
});