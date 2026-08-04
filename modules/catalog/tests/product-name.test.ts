import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  ProductName,
} from '../src/index.js';

describe('ProductName', () => {
  it('creates a valid product name', () => {
    const name = ProductName.create(
      'Blusa Canelada Feminina',
    );

    expect(name.value).toBe(
      'Blusa Canelada Feminina',
    );
  });

  it('removes surrounding spaces', () => {
    const name = ProductName.create(
      '  Blusa Canelada  ',
    );

    expect(name.value).toBe(
      'Blusa Canelada',
    );
  });

  it('replaces repeated spaces with a single space', () => {
    const name = ProductName.create(
      'Blusa    Canelada     Feminina',
    );

    expect(name.value).toBe(
      'Blusa Canelada Feminina',
    );
  });

  it('compares two names by normalized value', () => {
    const firstName = ProductName.create(
      'Blusa   Canelada',
    );

    const secondName = ProductName.create(
      'Blusa Canelada',
    );

    expect(firstName.equals(secondName)).toBe(true);
  });

  it('rejects an empty name', () => {
    expect(() => ProductName.create('   '))
      .toThrow('Product name cannot be empty');
  });

  it('rejects a name longer than 120 characters', () => {
    const value = 'A'.repeat(121);

    expect(() => ProductName.create(value))
      .toThrow(
        'Product name must have at most 120 characters',
      );
  });
});