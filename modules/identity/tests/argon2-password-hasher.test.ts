import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  Argon2PasswordHasher,
} from '../src/index.js';

describe('Argon2PasswordHasher', () => {
  it('hashes a password using Argon2id', async () => {
    const hasher =
      new Argon2PasswordHasher();

    const password =
      'uma senha longa e segura';

    const hash =
      await hasher.hash(
        password,
      );

    expect(hash).not.toBe(
      password,
    );

    expect(
      hash.startsWith(
        '$argon2id$',
      ),
    ).toBe(true);
  });

  it('verifies the correct password', async () => {
    const hasher =
      new Argon2PasswordHasher();

    const password =
      'uma senha longa e segura';

    const hash =
      await hasher.hash(
        password,
      );

    await expect(
      hasher.verify(
        password,
        hash,
      ),
    ).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hasher =
      new Argon2PasswordHasher();

    const hash =
      await hasher.hash(
        'uma senha longa e segura',
      );

    await expect(
      hasher.verify(
        'outra senha longa e segura',
        hash,
      ),
    ).resolves.toBe(false);
  });

  it('uses a different salt for each hash', async () => {
    const hasher =
      new Argon2PasswordHasher();

    const password =
      'uma senha longa e segura';

    const firstHash =
      await hasher.hash(
        password,
      );

    const secondHash =
      await hasher.hash(
        password,
      );

    expect(firstHash).not.toBe(
      secondHash,
    );
  });
});