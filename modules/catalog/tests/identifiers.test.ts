import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  parseCategoryId,
  parseProductId,
  parseTenantId,
} from '../src/index.js';

describe('catalog identifiers', () => {
  it('creates a valid ProductId', () => {
    const productId = parseProductId(
      '550e8400-e29b-41d4-a716-446655440000',
    );

    expect(productId).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('creates a valid TenantId', () => {
    const tenantId = parseTenantId(
      '10d2a772-6d35-4d56-a36d-46b27a897d01',
    );

    expect(tenantId).toBe(
      '10d2a772-6d35-4d56-a36d-46b27a897d01',
    );
  });

  it('creates a valid CategoryId', () => {
    const categoryId = parseCategoryId(
      '4df425b8-e69d-4c20-a26c-eb8f5cbf21e8',
    );

    expect(categoryId).toBe(
      '4df425b8-e69d-4c20-a26c-eb8f5cbf21e8',
    );
  });

  it('normalizes identifiers to lowercase', () => {
    const productId = parseProductId(
      '550E8400-E29B-41D4-A716-446655440000',
    );

    expect(productId).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('rejects an invalid ProductId', () => {
    expect(() => parseProductId('invalid-product-id'))
      .toThrow(TypeError);
  });

  it('rejects an invalid TenantId', () => {
    expect(() => parseTenantId('invalid-tenant-id'))
      .toThrow(TypeError);
  });

  it('rejects an invalid CategoryId', () => {
    expect(() => parseCategoryId('invalid-category-id'))
      .toThrow(TypeError);
  });
});