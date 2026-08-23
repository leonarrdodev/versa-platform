import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseUuid,
} from '@versa/shared-kernel';

import type {
  Clock,
  IdGenerator,
  Uuid,
} from '@versa/shared-kernel';

import {
  Tenant,
  TenantName,
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

class SequenceIdGenerator implements IdGenerator {
  private currentIndex = 0;

  constructor(
    private readonly values: readonly Uuid[],
  ) {}

  generate(): Uuid {
    const value =
      this.values[this.currentIndex];

    if (value === undefined) {
      throw new Error(
        'No UUID configured for this generation',
      );
    }

    this.currentIndex += 1;

    return value;
  }
}

const TENANT_ID = parseUuid(
  '11111111-1111-4111-8111-111111111111',
);

const FIXED_DATE = new Date(
  '2026-08-20T23:30:00.000Z',
);

function createTenant(): Tenant {
  return Tenant.create(
    {
      name: TenantName.create(
        'Versa Wear',
      ),
    },
    {
      clock:
        new FixedClock(FIXED_DATE),

      idGenerator:
        new SequenceIdGenerator([
          TENANT_ID,
        ]),
    },
  );
}

describe('Tenant', () => {
  it('creates a tenant with its domain data', () => {
    const tenant = createTenant();

    expect(tenant.id).toBe(
      TENANT_ID,
    );

    expect(
      tenant.name.value,
    ).toBe(
      'Versa Wear',
    );
  });

  it('starts the tenant with active status', () => {
    const tenant = createTenant();

    expect(tenant.status).toBe(
      'active',
    );
  });

  it('uses the injected clock for timestamps', () => {
    const tenant = createTenant();

    expect(
      tenant.createdAt.toISOString(),
    ).toBe(
      '2026-08-20T23:30:00.000Z',
    );

    expect(
      tenant.updatedAt.toISOString(),
    ).toBe(
      '2026-08-20T23:30:00.000Z',
    );
  });

  it('protects dates against external mutation', () => {
    const tenant = createTenant();

    const createdAt =
      tenant.createdAt;

    createdAt.setFullYear(2000);

    expect(
      tenant.createdAt.toISOString(),
    ).toBe(
      '2026-08-20T23:30:00.000Z',
    );
  });
});