import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  Email,
} from '../src/index.js';

describe('Email', () => {
  it('creates a valid email', () => {
    const email = Email.create(
      'leo@example.com',
    );

    expect(email.value).toBe(
      'leo@example.com',
    );
  });

  it('removes surrounding spaces', () => {
    const email = Email.create(
      '  leo@example.com  ',
    );

    expect(email.value).toBe(
      'leo@example.com',
    );
  });

  it('creates a normalized email value', () => {
    const email = Email.create(
      'Leo@Example.COM',
    );

    expect(
      email.normalizedValue,
    ).toBe(
      'leo@example.com',
    );
  });

  it('preserves the presentation value', () => {
    const email = Email.create(
      'Leo@Example.COM',
    );

    expect(email.value).toBe(
      'Leo@Example.COM',
    );
  });

  it('compares emails by normalized value', () => {
    const firstEmail = Email.create(
      'Leo@Example.com',
    );

    const secondEmail = Email.create(
      'leo@example.COM',
    );

    expect(
      firstEmail.equals(secondEmail),
    ).toBe(true);
  });

  it('rejects an empty email', () => {
    expect(
      () => Email.create('   '),
    ).toThrow(
      'Email cannot be empty',
    );
  });

  it('rejects an email without at sign', () => {
    expect(
      () => Email.create(
        'leo.example.com',
      ),
    ).toThrow(
      'Email has an invalid format',
    );
  });

  it('rejects an email without domain', () => {
    expect(
      () => Email.create('leo@'),
    ).toThrow(
      'Email has an invalid format',
    );
  });

  it('rejects an email longer than 254 characters', () => {
    const value =
      `${'a'.repeat(243)}@example.com`;

    expect(
      () => Email.create(value),
    ).toThrow(
      'Email must have at most 254 characters',
    );
  });
});