import {
  describe,
  expect,
  it,
} from 'vitest';

import type {
  Clock,
} from '@versa/shared-kernel';

import {
  parseTenantId,
  parseUserId,
  TenantMembership,
} from '../src/index.js';

class FixedClock implements Clock {
  constructor(
    private readonly fixedDate: Date,
  ) {}

  now(): Date {
    return new Date(
      this.fixedDate.getTime(),
    );
  }
}

const USER_ID = parseUserId(
  '11111111-1111-4111-8111-111111111111',
);

const TENANT_ID = parseTenantId(
  '22222222-2222-4222-8222-222222222222',
);

const FIXED_DATE = new Date(
  '2026-08-21T00:00:00.000Z',
);

function createMembership():
  TenantMembership {
  return TenantMembership.create(
    {
      userId: USER_ID,
      tenantId: TENANT_ID,
      role: 'owner',
    },
    {
      clock:
        new FixedClock(FIXED_DATE),
    },
  );
}

describe('TenantMembership', () => {
  it('creates a membership between user and tenant', () => {
    const membership =
      createMembership();

    expect(
      membership.userId,
    ).toBe(USER_ID);

    expect(
      membership.tenantId,
    ).toBe(TENANT_ID);

    expect(
      membership.role,
    ).toBe('owner');
  });

  it('starts the membership with active status', () => {
    const membership =
      createMembership();

    expect(
      membership.status,
    ).toBe('active');
  });

  it('uses the injected clock for timestamps', () => {
    const membership =
      createMembership();

    expect(
      membership.createdAt.toISOString(),
    ).toBe(
      '2026-08-21T00:00:00.000Z',
    );

    expect(
      membership.updatedAt.toISOString(),
    ).toBe(
      '2026-08-21T00:00:00.000Z',
    );
  });

  it('protects dates against external mutation', () => {
    const membership =
      createMembership();

    const createdAt =
      membership.createdAt;

    createdAt.setFullYear(2000);

    expect(
      membership.createdAt.toISOString(),
    ).toBe(
      '2026-08-21T00:00:00.000Z',
    );
  });
});