import {
  createHash,
} from 'node:crypto';

import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  Sha256SessionTokenHasher,
} from '../src/index.js';

describe('Sha256SessionTokenHasher', () => {
  it('hashes a session token using SHA-256', () => {
    const hasher =
      new Sha256SessionTokenHasher();

    const token =
      'v1.example-session-token';

    const expectedDigest =
      createHash('sha256')
        .update(
          token,
          'utf8',
        )
        .digest(
          'hex',
        );

    const result =
      hasher.hash(
        token,
      );

    expect(
      result.value,
    ).toBe(
      `sha256:${expectedDigest}`,
    );
  });

  it('produces the same hash for the same token', () => {
    const hasher =
      new Sha256SessionTokenHasher();

    const first =
      hasher.hash(
        'v1.same-token',
      );

    const second =
      hasher.hash(
        'v1.same-token',
      );

    expect(
      first.equals(second),
    ).toBe(true);
  });

  it('produces different hashes for different tokens', () => {
    const hasher =
      new Sha256SessionTokenHasher();

    const first =
      hasher.hash(
        'v1.first-token',
      );

    const second =
      hasher.hash(
        'v1.second-token',
      );

    expect(
      first.equals(second),
    ).toBe(false);
  });
});