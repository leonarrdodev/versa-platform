import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isUuid,
  RandomUuidGenerator,
} from '../src/index.js';

describe('RandomUuidGenerator', () => {
  it('generates a valid UUID', () => {
    const generator = new RandomUuidGenerator();

    const generatedId = generator.generate();

    expect(isUuid(generatedId)).toBe(true);
  });

  it('generates different UUIDs', () => {
    const generator = new RandomUuidGenerator();

    const firstId = generator.generate();
    const secondId = generator.generate();

    expect(firstId).not.toBe(secondId);
  });
});