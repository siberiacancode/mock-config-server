import { isPrimitive } from './isPrimitive';

describe('isPrimitive', () => {
  test('Object value should return false', () => {
    expect(isPrimitive(Object({}))).toBe(false);
  });

  test('Function value should return false', () => {
    expect(isPrimitive(() => {})).toBe(false);
  });

  test('Array value should return false', () => {
    expect(isPrimitive(Array([]))).toBe(false);
  });

  test('All Primitives should return true', () => {
    expect(isPrimitive(Boolean(true))).toBe(true);
    expect(isPrimitive(Number(1))).toBe(true);
    expect(isPrimitive(BigInt(9007199254740991n))).toBe(true);
    expect(isPrimitive(String())).toBe(true);
    expect(isPrimitive(String('test'))).toBe(true);
    expect(isPrimitive(Symbol('test'))).toBe(true);
    expect(isPrimitive(undefined)).toBe(true);
    expect(isPrimitive(null)).toBe(true);
  });
});
