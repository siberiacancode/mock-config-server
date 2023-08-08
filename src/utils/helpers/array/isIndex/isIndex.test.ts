import { isIndex } from '@/utils/helpers';

describe('isIndex', () => {
  test('Should return true for positive integer value', () => {
    expect(isIndex(5)).toBe(true);
  });

  test('Should return true for 0', () => {
    expect(isIndex(0)).toBe(true);
  });

  test('Should return false for negative integer value', () => {
    expect(isIndex(-5)).toBe(false);
  });

  test('Should return false for floating point value', () => {
    expect(isIndex(1.5)).toBe(false);
  });

  test('Should return false for non-numeric value', () => {
    expect(isIndex(true)).toBe(false);
    expect(isIndex('hello')).toBe(false);
    expect(isIndex(null)).toBe(false);
    expect(isIndex(undefined)).toBe(false);
    expect(isIndex({})).toBe(false);
    expect(isIndex([])).toBe(false);
    expect(isIndex(() => {})).toBe(false);
    expect(isIndex(Symbol('symbol'))).toBe(false);
  });
});
