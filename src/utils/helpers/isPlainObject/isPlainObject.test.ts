import { isPlainObject } from './isPlainObject';

describe('isPlainObject', () => {
  test('Object value should return true', () => {
    expect(isPlainObject(Object({}))).toBe(true);
  });

  test('All Primitive, array, function values should return false', () => {
    expect(isPlainObject(Number(1))).toBe(false);
    expect(isPlainObject(BigInt(9007199254740991n))).toBe(false);
    expect(isPlainObject(String('test'))).toBe(false);
    expect(isPlainObject(Boolean(true))).toBe(false);
    expect(isPlainObject(Symbol('test'))).toBe(false);
    expect(isPlainObject(Array([]))).toBe(false);
    expect(isPlainObject(() => {})).toBe(false);
    expect(isPlainObject(undefined)).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(/\d/)).toBe(false);
  });
});
