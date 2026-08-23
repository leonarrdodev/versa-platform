import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  PasswordSecret,
} from '../src/index.js';

describe('PasswordSecret', () => {
  it('accepts a password with at least 15 characters', () => {
    const password =
      PasswordSecret.create(
        'uma senha longa e segura',
      );

    expect(
      password.exposeForHashing(),
    ).toBe(
      'uma senha longa e segura',
    );
  });

  it('does not require composition rules', () => {
    expect(
      () =>
        PasswordSecret.create(
          'somente letras e espacos',
        ),
    ).not.toThrow();
  });

  it('preserves surrounding spaces', () => {
    const password =
      PasswordSecret.create(
        '  senha longa e secreta  ',
      );

    expect(
      password.exposeForHashing(),
    ).toBe(
      '  senha longa e secreta  ',
    );
  });

  it('normalizes unicode using NFC', () => {
    const value =
      'minha senha cafe\u0301 segura';

    const password =
      PasswordSecret.create(
        value,
      );

    expect(
      password.exposeForHashing(),
    ).toBe(
      value.normalize('NFC'),
    );
  });

  it('rejects a password shorter than 15 characters', () => {
    expect(
      () =>
        PasswordSecret.create(
          'senha curta',
        ),
    ).toThrow(
      'Password must have at least 15 characters',
    );
  });

  it('rejects a password longer than 128 characters', () => {
    const value =
      'a'.repeat(129);

    expect(
      () =>
        PasswordSecret.create(
          value,
        ),
    ).toThrow(
      'Password must have at most 128 characters',
    );
  });
});