import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  SessionTokenHash,
} from '../src/index.js';

const VALID_HASH =
  `sha256:${'a'.repeat(64)}`;

describe('SessionTokenHash', () => {
  it('creates a valid session token hash', () => {
    const hash =
      SessionTokenHash.create(
        VALID_HASH,
      );

    expect(
      hash.value,
    ).toBe(
      VALID_HASH,
    );
  });

  it('compares hashes by value', () => {
    const first =
      SessionTokenHash.create(
        VALID_HASH,
      );

    const second =
      SessionTokenHash.create(
        VALID_HASH,
      );

    expect(
      first.equals(second),
    ).toBe(true);
  });

  it('rejects a raw token', () => {
    expect(
      () =>
        SessionTokenHash.create(
          'raw-session-token',
        ),
    ).toThrow(
      'Session token hash has an invalid format',
    );
  });

  it('rejects a malformed SHA-256 hash', () => {
    expect(
      () =>
        SessionTokenHash.create(
          'sha256:abc',
        ),
    ).toThrow(
      'Session token hash has an invalid format',
    );
  });
});