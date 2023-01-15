import { isEntityValuesEqual } from './isEntityValuesEqual';

describe('isEntityValuesEqual', () => {
  test('Primitive values should compare independent of their types', () => {
    expect(isEntityValuesEqual(13, '13')).toBe(true);
    expect(isEntityValuesEqual(true, 'true')).toBe(true);
  });

  test('Arrays should be full equal with nested objects (independent of primitive values types)', () => {
    expect(isEntityValuesEqual([1, 2, 3], ['1', '2', '3'])).toBe(true);

    expect(
      isEntityValuesEqual(
        [{ key1: 'value1', key2: 'value2' }],
        [{ key2: 'value2', key1: 'value1' }]
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual(
        [{ key1: 'value1', key2: 'value2' }],
        [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
      )
    ).toBe(false);

    expect(
      isEntityValuesEqual(
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual(
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
      )
    ).toBe(false);
  });

  test('Plain objects should compare by "second includes first" with nested objects', () => {
    expect(
      isEntityValuesEqual(
        { key1: 'value1', key2: 'value2' },
        { key1: 'value1', key2: 'value2', key3: 'value3' }
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual(
        { key1: 'value1', key2: 'value2', key3: 'value3' },
        { key1: 'value1', key2: 'value2' }
      )
    ).toBe(false);

    expect(
      isEntityValuesEqual(
        { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } },
        {
          key1: 'value1',
          key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
          key3: 'value3'
        }
      )
    ).toBe(true);
  });
});
