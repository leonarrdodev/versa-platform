import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  CryptoSessionTokenGenerator,
} from '../src/index.js';

describe('CryptoSessionTokenGenerator', () => {
  it('generates a versioned session token', () => {
    const generator =
      new CryptoSessionTokenGenerator();

    const token =
      generator.generate();

    expect(
      token.startsWith(
        'v1.',
      ),
    ).toBe(true);
  });

  it('generates different tokens', () => {
    const generator =
      new CryptoSessionTokenGenerator();

    const firstToken =
      generator.generate();

    const secondToken =
      generator.generate();

    expect(
      firstToken,
    ).not.toBe(
      secondToken,
    );
  });

  it('generates a token with 32 random bytes encoded as base64url', () => {
    const generator =
      new CryptoSessionTokenGenerator();

    const token =
      generator.generate();

    const encodedSecret =
      token.slice(
        'v1.'.length,
      );

    const decoded =
      Buffer.from(
        encodedSecret,
        'base64url',
      );

    expect(
      decoded.length,
    ).toBe(32);
  });
});