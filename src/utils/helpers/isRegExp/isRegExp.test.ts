import { isRegExp } from './isRegExp';

describe('isRegExp', () => {
  it('RegExp value should return true', () => {
    expect(isRegExp(/\d/)).toBe(true);
  });

  it('All Primitive, array, object, function values should return false', () => {
    expect(isRegExp(Number(1))).toBe(false);
    expect(isRegExp(BigInt(9007199254740991n))).toBe(false);
    expect(isRegExp(String('test'))).toBe(false);
    expect(isRegExp(Boolean(true))).toBe(false);
    expect(isRegExp(Symbol('test'))).toBe(false);
    expect(isRegExp(Array([]))).toBe(false);
    expect(isRegExp(Object({}))).toBe(false);
    expect(isRegExp(() => {})).toBe(false);
    expect(isRegExp(undefined)).toBe(false);
    expect(isRegExp(null)).toBe(false);
  });
});
