import {
  describe,
  expect,
  it,
} from 'vitest';

import {
  isUuid,
  parseUuid,
} from '../src/index.js';

describe('isUuid', () => {
  it('accepts a valid lowercase UUID', () => {
    const value = '550e8400-e29b-41d4-a716-446655440000';

    expect(isUuid(value)).toBe(true);
  });

  it('accepts a valid uppercase UUID', () => {
    const value = '550E8400-E29B-41D4-A716-446655440000';

    expect(isUuid(value)).toBe(true);
  });

  it('rejects a regular string', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
  });

  it('rejects a UUID without hyphens', () => {
    const value = '550e8400e29b41d4a716446655440000';

    expect(isUuid(value)).toBe(false);
  });

  it('rejects non-hexadecimal characters', () => {
    const value = '550e8400-e29b-41d4-a716-44665544000z';

    expect(isUuid(value)).toBe(false);
  });
});

describe('parseUuid', () => {
  it('returns a valid UUID', () => {
    const value = '550e8400-e29b-41d4-a716-446655440000';

    expect(parseUuid(value)).toBe(value);
  });

  it('normalizes the UUID to lowercase', () => {
    const value = '550E8400-E29B-41D4-A716-446655440000';

    expect(parseUuid(value)).toBe(
      '550e8400-e29b-41d4-a716-446655440000',
    );
  });

  it('throws TypeError when the UUID is invalid', () => {
    expect(() => parseUuid('invalid-value')).toThrow(TypeError);
  });

  it('includes the invalid value in the error message', () => {
    expect(() => parseUuid('invalid-value')).toThrow(
      'Invalid UUID: invalid-value',
    );
  });
});