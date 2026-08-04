import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  ProductSku,
} from '../src/index.js';

describe('ProductSku', () => {
  it('creates a valid SKU', () => {
    const sku = ProductSku.create('BLUSA-001');

    expect(sku.value).toBe('BLUSA-001');
  });

  it('removes surrounding spaces', () => {
    const sku = ProductSku.create('  BLUSA-001  ');

    expect(sku.value).toBe('BLUSA-001');
  });

  it('normalizes letters to uppercase', () => {
    const sku = ProductSku.create('blusa-preta-m');

    expect(sku.value).toBe('BLUSA-PRETA-M');
  });

  it('accepts supported separators', () => {
    const sku = ProductSku.create('VERSA_001.PRETA-M');

    expect(sku.value).toBe('VERSA_001.PRETA-M');
  });

  it('compares two SKUs by value', () => {
    const firstSku = ProductSku.create('blusa-001');
    const secondSku = ProductSku.create('BLUSA-001');

    expect(firstSku.equals(secondSku)).toBe(true);
  });

  it('rejects an empty SKU', () => {
    expect(() => ProductSku.create('   '))
      .toThrow('Product SKU cannot be empty');
  });

  it('rejects spaces inside the SKU', () => {
    expect(() => ProductSku.create('BLUSA PRETA'))
      .toThrow('Product SKU contains invalid characters');
  });

  it('rejects unsupported characters', () => {
    expect(() => ProductSku.create('BLUSA@001'))
      .toThrow('Product SKU contains invalid characters');
  });

  it('rejects a SKU starting with a separator', () => {
    expect(() => ProductSku.create('-BLUSA-001'))
      .toThrow('Product SKU contains invalid characters');
  });

  it('rejects a SKU longer than 64 characters', () => {
    const value = 'A'.repeat(65);

    expect(() => ProductSku.create(value))
      .toThrow('Product SKU must have at most 64 characters');
  });
});