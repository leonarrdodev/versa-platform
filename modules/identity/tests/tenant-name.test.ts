import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  TenantName,
} from '../src/index.js';

describe('TenantName', () => {
  it('creates a valid tenant name', () => {
    const name =
      TenantName.create(
        'Versa Wear',
      );

    expect(name.value).toBe(
      'Versa Wear',
    );
  });

  it('removes surrounding spaces', () => {
    const name =
      TenantName.create(
        '  Versa Wear  ',
      );

    expect(name.value).toBe(
      'Versa Wear',
    );
  });

  it('replaces repeated spaces', () => {
    const name =
      TenantName.create(
        'Versa     Wear',
      );

    expect(name.value).toBe(
      'Versa Wear',
    );
  });

  it('rejects an empty tenant name', () => {
    expect(
      () => TenantName.create('   '),
    ).toThrow(
      'Tenant name cannot be empty',
    );
  });

  it('rejects a tenant name longer than 120 characters', () => {
    const value = 'A'.repeat(121);

    expect(
      () => TenantName.create(value),
    ).toThrow(
      'Tenant name must have at most 120 characters',
    );
  });
});