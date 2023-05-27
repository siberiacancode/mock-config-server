import { isEntityValuesEqual } from './isEntityValuesEqual';

describe('isEntityValuesEqual', () => {
  test('All Primitive values should compare independent of their types', () => {
    expect(isEntityValuesEqual('equals', 12, '12')).toBe(true);
    expect(isEntityValuesEqual('equals', true, 'true')).toBe(true);
    expect(isEntityValuesEqual('equals', null, 'null')).toBe(true);
    expect(isEntityValuesEqual('equals', 'string', 'string')).toBe(true);
  });

  test('Arrays should be full equal with nested objects (independent of primitive values types)', () => {
    expect(isEntityValuesEqual('equals', [1, 2, 3], ['1', '2', '3'])).toBe(true);

    expect(
      isEntityValuesEqual('equals',
        [{ key1: 'value1', key2: 'value2' }],
        [{ key2: 'value2', key1: 'value1' }]
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual('equals',
        [{ key1: 'value1', key2: 'value2' }],
        [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
      )
    ).toBe(false);

    expect(
      isEntityValuesEqual('equals',
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual('equals',
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
        [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
      )
    ).toBe(false);
  });

  test('Plain objects should compare by "first includes second" with nested objects', () => {
    expect(
      isEntityValuesEqual('equals',
        { key1: 'value1', key2: 'value2', key3: 'value3' },
        { key1: 'value1', key2: 'value2' }
      )
    ).toBe(true);

    expect(
      isEntityValuesEqual('equals',
        { key1: 'value1', key2: 'value2' },
        { key1: 'value1', key2: 'value2', key3: 'value3' }
      )
    ).toBe(false);

    expect(
      isEntityValuesEqual('equals',
        {
          key1: 'value1',
          key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
          key3: 'value3'
        },
        { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } },
      )
    ).toBe(true);
  });

  test('Should count "undefined" string and true undefined as different values', () =>{
    expect(isEntityValuesEqual('equals', undefined, 'undefined')).toBe(false);
  });
});
