import { filterTokenValues } from './filterTokenValues';

describe('filterTokenValues', () => {
  const rawTokenValues = {
    key1: 'value1',
    key2: 'value2',
    key3: 'value3',
    key4: {
      nestedKey1: 'nestedValue1',
      nestedKey2: 'nestedValue2',
      nestedKey3: 'nestedValue3'
    }
  };

  test('Should remain only truthy options by whitelist logic on first level', () => {
    const tokenOptions = {
      key1: true,
      key2: false,
      key4: true
    };

    const result = filterTokenValues(rawTokenValues, tokenOptions);

    expect(result).toStrictEqual({
      key1: 'value1',
      key4: {
        nestedKey1: 'nestedValue1',
        nestedKey2: 'nestedValue2',
        nestedKey3: 'nestedValue3'
      }
    });
  });

  test('Should remain only truthy options by whitelist logic on second level', () => {
    expect(
      filterTokenValues(rawTokenValues, {
        key4: {
          nestedKey1: true,
          nestedKey2: true
        }
      })
    ).toStrictEqual({
      key4: {
        nestedKey1: 'nestedValue1',
        nestedKey2: 'nestedValue2'
      }
    });

    expect(
      filterTokenValues(rawTokenValues, {
        key4: {
          nestedKey1: true,
          nestedKey2: false
        }
      })
    ).toStrictEqual({
      key4: {
        nestedKey1: 'nestedValue1'
      }
    });
  });

  test('Should remove all falsy options by blacklist logic on second level', () => {
    expect(
      filterTokenValues(rawTokenValues, {
        key1: true,
        key4: {
          nestedKey1: false,
          nestedKey2: false
        }
      })
    ).toStrictEqual({
      key1: 'value1',
      key4: {
        nestedKey3: 'nestedValue3'
      }
    });
  });
});
