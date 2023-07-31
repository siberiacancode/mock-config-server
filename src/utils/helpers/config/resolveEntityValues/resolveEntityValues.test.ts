import type { CheckFunction, CheckMode } from '@/utils/types';

import { resolveEntityValues } from './resolveEntityValues';

describe('resolveEntityValues', () => {
  test('Should throw error if provided wrong checkMode', () => {
    expect(() => resolveEntityValues('wrongCheckMode' as CheckMode, '1', '1')).toThrow(
      new Error('Wrong checkMode')
    );
  });

  describe('"exists" checkMode', () => {
    describe('actual: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('exists', 12)).toBe(true);
        expect(resolveEntityValues('exists', true)).toBe(true);
        expect(resolveEntityValues('exists', null)).toBe(true);
        expect(resolveEntityValues('exists', 'string')).toBe(true);
        expect(resolveEntityValues('exists', 'undefined')).toBe(true);
        expect(resolveEntityValues('exists', undefined)).toBe(false);
      });
    });

    describe('actual: array', () => {
      test('Any array should be count as existed', () => {
        expect(resolveEntityValues('exists', ['true', '2', 'string'])).toBe(true);
      });
    });

    describe('actual: object', () => {
      test('Any object should be count as existed', () => {
        expect(
          resolveEntityValues('exists', { key1: 'value1', key2: 'value2', key3: 'value3' })
        ).toBe(true);
      });
    });
  });

  describe('"notExists" checkMode', () => {
    describe('actual: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('notExists', 12)).toBe(false);
        expect(resolveEntityValues('notExists', true)).toBe(false);
        expect(resolveEntityValues('notExists', null)).toBe(false);
        expect(resolveEntityValues('notExists', 'string')).toBe(false);
        expect(resolveEntityValues('notExists', 'undefined')).toBe(false);
        expect(resolveEntityValues('notExists', undefined)).toBe(true);
      });
    });

    describe('actual: array', () => {
      test('Any array should be count as existed', () => {
        expect(resolveEntityValues('notExists', ['true', '2', 'string'])).toBe(false);
      });
    });

    describe('actual: object', () => {
      test('Any object should be count as existed', () => {
        expect(
          resolveEntityValues('notExists', { key1: 'value1', key2: 'value2', key3: 'value3' })
        ).toBe(false);
      });
    });
  });

  describe('"equals" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('equals', '12', 12)).toBe(true);
        expect(resolveEntityValues('equals', 'true', true)).toBe(true);
        expect(resolveEntityValues('equals', 'null', null)).toBe(true);
        expect(resolveEntityValues('equals', 'string', 'string')).toBe(true);
        expect(resolveEntityValues('equals', 'string2', 'string')).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('equals', '12', [11, 12, '12'])).toBe(true);
        expect(resolveEntityValues('equals', '12', [11, 13, '13'])).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be equal object', () => {
        expect(resolveEntityValues('equals', 12, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('equals', true, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('equals', null, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('equals', 'string', { key: 'value' })).toBe(false);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be equal primitive', () => {
        expect(resolveEntityValues('equals', [11, 12, '12'], '12')).toBe(false);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should not be count as equal', () => {
        expect(resolveEntityValues('equals', ['true', '2'], [true, 2, 'string'])).toBe(false);
        expect(resolveEntityValues('equals', ['true', '2', 'string'], [true, 2])).toBe(false);
      });
      test('Arrays should be full equal with nested objects (independent of primitive values types)', () => {
        expect(resolveEntityValues('equals', ['true', '2', 'string'], [true, 2, 'string'])).toBe(
          true
        );
        expect(
          resolveEntityValues(
            'equals',
            [{ key1: 'value1', key2: '111' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'equals',
            [{ key1: 'value1', key2: 'value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'equals',
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'equals',
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(false);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be equal object', () => {
        expect(resolveEntityValues('equals', [], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('equals', [true, 2, 'string'], { key: 'value' })).toBe(false);
        expect(
          resolveEntityValues('equals', [{ key: 'value' }, { key: 'value2' }], { key: 'value' })
        ).toBe(false);
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be equal primitive', () => {
        expect(resolveEntityValues('equals', { key: 'value' }, 12)).toBe(false);
        expect(resolveEntityValues('equals', { key: 'value' }, true)).toBe(false);
        expect(resolveEntityValues('equals', { key: 'value' }, null)).toBe(false);
        expect(resolveEntityValues('equals', { key: 'value' }, 'string')).toBe(false);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('equals', { key: 'value' }, [])).toBe(false);
        expect(resolveEntityValues('equals', { key: 'value' }, [true, 2, 'string'])).toBe(false);
        expect(
          resolveEntityValues('equals', { key: 'value' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(false);
        expect(resolveEntityValues('equals', { key: 'value' }, [{ key: 'value' }])).toBe(true);
        expect(
          resolveEntityValues('equals', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(false);
        expect(
          resolveEntityValues('equals', { user: { phone: '99091230102' } }, [
            { user: { phone: '99091230102' } },
            { user: { phone: '89091230102' } }
          ])
        ).toBe(true);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'equals',
            { key1: 'value1', key2: 'value2', key3: 'value3' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'equals',
            { key1: 'value1', key2: 'value2' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'equals',
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(true);
      });
    });
  });

  describe('"notEquals" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('notEquals', 'true', true)).toBe(false);
        expect(resolveEntityValues('notEquals', 'null', null)).toBe(false);
        expect(resolveEntityValues('notEquals', '12', 12)).toBe(false);
        expect(resolveEntityValues('notEquals', 'string', 'string')).toBe(false);
        expect(resolveEntityValues('notEquals', 'string2', 'string')).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('notEquals', '12', [11, 12, '12'])).toBe(false);
        expect(resolveEntityValues('notEquals', '12', [11, 13, '13'])).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be equal object', () => {
        expect(resolveEntityValues('notEquals', 12, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEquals', true, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEquals', null, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEquals', 'string', { key: 'value' })).toBe(true);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be equal primitive', () => {
        expect(resolveEntityValues('notEquals', [11, 12, '12'], '12')).toBe(true);
        expect(resolveEntityValues('notEquals', [11, 13, '13'], '12')).toBe(true);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should be count as notEquals', () => {
        expect(resolveEntityValues('notEquals', ['true', '2'], [true, 2, 'string'])).toBe(true);
        expect(resolveEntityValues('notEquals', ['true', '2', 'string'], [true, 2])).toBe(true);
      });
      test('Arrays should be full equal with nested objects (independent of primitive values types)', () => {
        expect(resolveEntityValues('notEquals', ['true', '2', 'string'], [true, 2, 'string'])).toBe(
          false
        );
        expect(
          resolveEntityValues(
            'notEquals',
            [{ key1: 'value1', key2: '111' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notEquals',
            [{ key1: 'value1', key2: 'value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'notEquals',
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notEquals',
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(true);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be equal object', () => {
        expect(resolveEntityValues('notEquals', [], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEquals', [true, 2, 'string'], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEquals', [{ key: 'value' }], { key: 'value' })).toBe(true);
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be equal primitive', () => {
        expect(resolveEntityValues('notEquals', { key: 'value' }, 12)).toBe(true);
        expect(resolveEntityValues('notEquals', { key: 'value' }, true)).toBe(true);
        expect(resolveEntityValues('notEquals', { key: 'value' }, null)).toBe(true);
        expect(resolveEntityValues('notEquals', { key: 'value' }, 'string')).toBe(true);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('notEquals', { key: 'value' }, [])).toBe(true);
        expect(resolveEntityValues('notEquals', { key: 'value' }, [true, 2, 'string'])).toBe(true);
        expect(
          resolveEntityValues('notEquals', { key: 'value' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(true);
        expect(resolveEntityValues('notEquals', { key: 'value' }, [{ key: 'value' }])).toBe(false);
        expect(
          resolveEntityValues('notEquals', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(true);
        expect(
          resolveEntityValues('notEquals', { user: { phone: '99091230102' } }, [
            { user: { phone: '99091230102' } },
            { user: { phone: '89091230102' } }
          ])
        ).toBe(false);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'notEquals',
            { key1: 'value1', key2: 'value2', key3: 'value3' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEquals',
            { key1: 'value1', key2: 'value2' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEquals',
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue22' },
              key3: 'value3'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEquals',
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(false);
      });
    });
  });

  describe('"includes" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('includes', '312', 12)).toBe(true);
        expect(resolveEntityValues('includes', 'truee', true)).toBe(true);
        expect(resolveEntityValues('includes', '1null', null)).toBe(true);
        expect(resolveEntityValues('includes', 'string', 'string')).toBe(true);
        expect(resolveEntityValues('includes', 'string', 'string2')).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('includes', '123', [11, 12, '13'])).toBe(true);
        expect(resolveEntityValues('includes', '12', [111, 133, '134'])).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as included in object', () => {
        expect(resolveEntityValues('includes', 12, { key: '12' })).toBe(false);
        expect(resolveEntityValues('includes', true, { true: true })).toBe(false);
        expect(resolveEntityValues('includes', null, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('includes', 'string', { key: 'value' })).toBe(false);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as included in primitive', () => {
        expect(resolveEntityValues('includes', [113, 1222, '312'], '12')).toBe(false);
        expect(resolveEntityValues('includes', [111, 133, '133'], '12')).toBe(false);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should not be count as includes', () => {
        expect(resolveEntityValues('includes', ['true', '2'], [true, 2, 'string'])).toBe(false);
        expect(resolveEntityValues('includes', ['true', '2', 'string'], [true, 2])).toBe(false);
      });
      test('Arrays should be fully checked for "includes" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('includes', ['truee', '32', '53string'], [true, 2, 'string'])
        ).toBe(true);
        expect(
          resolveEntityValues(
            'includes',
            [{ key1: 'value122', key2: '31113' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'includes',
            [{ key1: 'value12', key2: '1value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'includes',
            [{ key1: 'value12', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'includes',
            [{ key1: 'value12', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(false);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as included in object', () => {
        expect(resolveEntityValues('includes', [], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('includes', [true, 2, 'value'], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('includes', [{ key: 'value33' }], { key: 'value' })).toBe(false);
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as included in primitive', () => {
        expect(resolveEntityValues('includes', { key: 'value' }, 12)).toBe(false);
        expect(resolveEntityValues('includes', { key: 'value' }, true)).toBe(false);
        expect(resolveEntityValues('includes', { key: 'value' }, null)).toBe(false);
        expect(resolveEntityValues('includes', { key: 'value' }, 'string')).toBe(false);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('includes', { key: 'value' }, [])).toBe(false);
        expect(resolveEntityValues('includes', { key: 'value' }, [true, 2, 'string'])).toBe(false);
        expect(
          resolveEntityValues('includes', { key: '1value2' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(false);
        expect(resolveEntityValues('includes', { key: '1value2' }, [{ key: 'value' }])).toBe(true);
        expect(
          resolveEntityValues('includes', { user: { phone: '99091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(false);
        expect(
          resolveEntityValues('includes', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(true);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'includes',
            { key1: 'value12', key2: 'value23', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'includes',
            { key1: 'value12', key2: 'value23' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'includes',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'includes',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(true);
      });
    });
  });

  describe('"notIncludes" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('notIncludes', '312', 12)).toBe(false);
        expect(resolveEntityValues('notIncludes', 'truee', true)).toBe(false);
        expect(resolveEntityValues('notIncludes', '1null', null)).toBe(false);
        expect(resolveEntityValues('notIncludes', 'string', 'string')).toBe(false);
        expect(resolveEntityValues('notIncludes', 'string', 'string2')).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('notIncludes', '123', [11, 12, '13'])).toBe(false);
        expect(resolveEntityValues('notIncludes', '12', [111, 133, '134'])).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as included in object', () => {
        expect(resolveEntityValues('notIncludes', 12, { key: '12' })).toBe(true);
        expect(resolveEntityValues('notIncludes', true, { true: true })).toBe(true);
        expect(resolveEntityValues('notIncludes', null, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notIncludes', 'string', { key: 'value' })).toBe(true);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as included in primitive', () => {
        expect(resolveEntityValues('notIncludes', [113, 1222, '312'], '12')).toBe(true);
        expect(resolveEntityValues('notIncludes', [111, 133, '133'], '12')).toBe(true);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should be count as notIncludes', () => {
        expect(resolveEntityValues('notIncludes', ['true', '2'], [true, 2, 'string'])).toBe(true);
        expect(resolveEntityValues('notIncludes', ['true', '2', 'string'], [true, 2])).toBe(true);
      });
      test('Arrays should be fully checked for "notIncludes" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('notIncludes', ['truee', '32', '53string'], [true, 2, 'string'])
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notIncludes',
            [{ key1: 'value122', key2: '31113' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notIncludes',
            [{ key1: 'value12', key2: '1value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'notIncludes',
            [{ key1: 'value12', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notIncludes',
            [{ key1: 'value12', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(true);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as included in object', () => {
        expect(resolveEntityValues('notIncludes', [], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notIncludes', [true, 2, 'value'], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notIncludes', [{ key: 'value33' }], { key: 'value' })).toBe(
          true
        );
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as included in primitive', () => {
        expect(resolveEntityValues('notIncludes', { key: 'value' }, 12)).toBe(true);
        expect(resolveEntityValues('notIncludes', { key: 'value' }, true)).toBe(true);
        expect(resolveEntityValues('notIncludes', { key: 'value' }, null)).toBe(true);
        expect(resolveEntityValues('notIncludes', { key: 'value' }, 'string')).toBe(true);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('notIncludes', { key: 'value' }, [])).toBe(true);
        expect(resolveEntityValues('notIncludes', { key: 'value' }, [true, 2, 'string'])).toBe(
          true
        );
        expect(
          resolveEntityValues('notIncludes', { key: '1value2' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(true);
        expect(resolveEntityValues('notIncludes', { key: '1value2' }, [{ key: 'value' }])).toBe(
          false
        );
        expect(
          resolveEntityValues('notIncludes', { user: { phone: '99091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(true);
        expect(
          resolveEntityValues('notIncludes', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(false);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'notIncludes',
            { key1: 'value12', key2: 'value23', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notIncludes',
            { key1: 'value12', key2: 'value23' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notIncludes',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notIncludes',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(false);
      });
    });
  });

  describe('"startsWith" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('startsWith', '123', 12)).toBe(true);
        expect(resolveEntityValues('startsWith', 'truee', true)).toBe(true);
        expect(resolveEntityValues('startsWith', 'null1', null)).toBe(true);
        expect(resolveEntityValues('startsWith', 'string', 'string')).toBe(true);
        expect(resolveEntityValues('startsWith', 'string', 'string2')).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('startsWith', '123', [11, 12, '13'])).toBe(true);
        expect(resolveEntityValues('startsWith', '12', [111, 133, '134'])).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as start of an object', () => {
        expect(resolveEntityValues('startsWith', 12, { key: '12' })).toBe(false);
        expect(resolveEntityValues('startsWith', true, { true: true })).toBe(false);
        expect(resolveEntityValues('startsWith', null, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('startsWith', 'string', { key: 'value' })).toBe(false);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as start of primitive', () => {
        expect(resolveEntityValues('startsWith', [113, 1222, '312'], '12')).toBe(false);
        expect(resolveEntityValues('startsWith', [111, 133, '133'], '12')).toBe(false);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should not be count as startsWith=', () => {
        expect(resolveEntityValues('startsWith', ['true', '2'], [true, 2, 'string'])).toBe(false);
        expect(resolveEntityValues('startsWith', ['true', '2', 'string'], [true, 2])).toBe(false);
      });
      test('Arrays should be fully checked for "startsWith" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('startsWith', ['truee', '23', 'string12'], [true, 2, 'string'])
        ).toBe(true);
        expect(
          resolveEntityValues(
            'startsWith',
            [{ key1: 'value122', key2: '1113' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'startsWith',
            [{ key1: 'value12', key2: 'value23' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'startsWith',
            [{ key1: 'value12', key2: { nestedKey1: 'nestedValue12' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'startsWith',
            [{ key1: 'value12', key2: { nestedKey1: 'nestedValue12' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(false);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as start of an object', () => {
        expect(resolveEntityValues('startsWith', [], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('startsWith', [true, 2, 'value'], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('startsWith', [{ key: 'value33' }], { key: 'value' })).toBe(
          false
        );
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as started with primitive', () => {
        expect(resolveEntityValues('startsWith', { key: 'value' }, 12)).toBe(false);
        expect(resolveEntityValues('startsWith', { key: 'value' }, true)).toBe(false);
        expect(resolveEntityValues('startsWith', { key: 'value' }, null)).toBe(false);
        expect(resolveEntityValues('startsWith', { key: 'value' }, 'string')).toBe(false);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('startsWith', { key: 'value' }, [])).toBe(false);
        expect(resolveEntityValues('startsWith', { key: 'value' }, [true, 2, 'string'])).toBe(
          false
        );
        expect(
          resolveEntityValues('startsWith', { key: 'value12' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(false);
        expect(resolveEntityValues('startsWith', { key: 'value12' }, [{ key: 'value' }])).toBe(
          true
        );
        expect(
          resolveEntityValues('startsWith', { user: { phone: '99091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(false);
        expect(
          resolveEntityValues('startsWith', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(true);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'startsWith',
            { key1: 'value12', key2: 'value23', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'startsWith',
            { key1: 'value12', key2: 'value23' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'startsWith',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'startsWith',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(true);
      });
    });
  });

  describe('"notStartsWith" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('notStartsWith', '123', 12)).toBe(false);
        expect(resolveEntityValues('notStartsWith', 'truee', true)).toBe(false);
        expect(resolveEntityValues('notStartsWith', 'null1', null)).toBe(false);
        expect(resolveEntityValues('notStartsWith', 'string', 'string')).toBe(false);
        expect(resolveEntityValues('notStartsWith', 'string', 'string2')).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('notStartsWith', '123', [11, 12, '13'])).toBe(false);
        expect(resolveEntityValues('notStartsWith', '12', [111, 133, '134'])).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as start of an object', () => {
        expect(resolveEntityValues('notStartsWith', 12, { key: '12' })).toBe(true);
        expect(resolveEntityValues('notStartsWith', true, { true: true })).toBe(true);
        expect(resolveEntityValues('notStartsWith', null, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notStartsWith', 'string', { key: 'value' })).toBe(true);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as start of primitive', () => {
        expect(resolveEntityValues('notStartsWith', [113, 1222, '312'], '12')).toBe(true);
        expect(resolveEntityValues('notStartsWith', [111, 133, '133'], '12')).toBe(true);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should be count as notStartsWith', () => {
        expect(resolveEntityValues('notStartsWith', ['true', '2'], [true, 2, 'string'])).toBe(true);
        expect(resolveEntityValues('notStartsWith', ['true', '2', 'string'], [true, 2])).toBe(true);
      });
      test('Arrays should be fully checked for "notStartsWith" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('notStartsWith', ['truee', '23', 'string12'], [true, 2, 'string'])
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notStartsWith',
            [{ key1: 'value122', key2: '1113' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notStartsWith',
            [{ key1: 'value12', key2: 'value23' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'notStartsWith',
            [{ key1: 'value12', key2: { nestedKey1: 'nestedValue12' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notStartsWith',
            [{ key1: 'value12', key2: { nestedKey1: 'nestedValue12' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(true);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as start of object', () => {
        expect(resolveEntityValues('notStartsWith', [], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notStartsWith', [true, 2, 'value'], { key: 'value' })).toBe(
          true
        );
        expect(resolveEntityValues('notStartsWith', [{ key: 'value33' }], { key: 'value' })).toBe(
          true
        );
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as started with primitive', () => {
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, 12)).toBe(true);
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, true)).toBe(true);
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, null)).toBe(true);
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, 'string')).toBe(true);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, [])).toBe(true);
        expect(resolveEntityValues('notStartsWith', { key: 'value' }, [true, 2, 'string'])).toBe(
          true
        );
        expect(
          resolveEntityValues('notStartsWith', { key: 'value12' }, [
            { key: 'value', key2: 'value2' }
          ])
        ).toBe(true);
        expect(resolveEntityValues('notStartsWith', { key: 'value12' }, [{ key: 'value' }])).toBe(
          false
        );
        expect(
          resolveEntityValues('notStartsWith', { user: { phone: '99091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(true);
        expect(
          resolveEntityValues('notStartsWith', { user: { phone: '79091230102' } }, [
            { user: { phone: '7' } },
            { user: { phone: '8' } }
          ])
        ).toBe(false);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'notStartsWith',
            { key1: 'value12', key2: 'value23', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notStartsWith',
            { key1: 'value12', key2: 'value23' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notStartsWith',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notStartsWith',
            {
              key1: 'value12',
              key2: { nestedKey1: 'nestedValue12', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' },
              key3: 'value3'
            }
          )
        ).toBe(false);
      });
    });
  });

  describe('"endsWith" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('endsWith', '312', 12)).toBe(true);
        expect(resolveEntityValues('endsWith', '1true', true)).toBe(true);
        expect(resolveEntityValues('endsWith', '1null', null)).toBe(true);
        expect(resolveEntityValues('endsWith', 'string', 'string')).toBe(true);
        expect(resolveEntityValues('endsWith', 'string', 'string2')).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('endsWith', '312', [11, 12, '13'])).toBe(true);
        expect(resolveEntityValues('endsWith', '12', [111, 133, '134'])).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as end of an object', () => {
        expect(resolveEntityValues('endsWith', 12, { key: '12' })).toBe(false);
        expect(resolveEntityValues('endsWith', true, { true: true })).toBe(false);
        expect(resolveEntityValues('endsWith', null, { key: 'value' })).toBe(false);
        expect(resolveEntityValues('endsWith', 'string', { key: 'value' })).toBe(false);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as end of primitive', () => {
        expect(resolveEntityValues('endsWith', [113, 1222, '312'], '12')).toBe(false);
        expect(resolveEntityValues('endsWith', [111, 133, '133'], '12')).toBe(false);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should not be count as endsWith', () => {
        expect(resolveEntityValues('endsWith', ['true', '2'], [true, 2, 'string'])).toBe(false);
        expect(resolveEntityValues('endsWith', ['true', '2', 'string'], [true, 2])).toBe(false);
      });
      test('Arrays should be fully checked for "endsWith" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('endsWith', ['1true', '32', '12string'], [true, 2, 'string'])
        ).toBe(true);
        expect(
          resolveEntityValues(
            'endsWith',
            [{ key1: '22value1', key2: '3111' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'endsWith',
            [{ key1: '2value1', key2: '3value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'endsWith',
            [{ key1: '2value1', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'endsWith',
            [{ key1: '2value1', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(false);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as end of object', () => {
        expect(resolveEntityValues('endsWith', [], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('endsWith', [true, 2, 'value'], { key: 'value' })).toBe(false);
        expect(resolveEntityValues('endsWith', [{ key: '33value' }], { key: 'value' })).toBe(false);
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as ended with primitive', () => {
        expect(resolveEntityValues('endsWith', { key: 'value' }, 12)).toBe(false);
        expect(resolveEntityValues('endsWith', { key: 'value' }, true)).toBe(false);
        expect(resolveEntityValues('endsWith', { key: 'value' }, null)).toBe(false);
        expect(resolveEntityValues('endsWith', { key: 'value' }, 'string')).toBe(false);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('endsWith', { key: 'value' }, [])).toBe(false);
        expect(resolveEntityValues('endsWith', { key: 'value' }, [true, 2, 'string'])).toBe(false);
        expect(
          resolveEntityValues('endsWith', { key: '12value' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(false);
        expect(resolveEntityValues('endsWith', { key: '12value' }, [{ key: 'value' }])).toBe(true);
        expect(
          resolveEntityValues('endsWith', { user: { phone: '99091230102' } }, [
            { user: { phone: '0' } },
            { user: { phone: '1' } }
          ])
        ).toBe(false);
        expect(
          resolveEntityValues('endsWith', { user: { phone: '99091230100' } }, [
            { user: { phone: '0' } },
            { user: { phone: '1' } }
          ])
        ).toBe(true);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'endsWith',
            { key1: '2value1', key2: '3value2', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'endsWith',
            { key1: '2value1', key2: '3value2' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'endsWith',
            {
              key1: '2value1',
              key2: { nestedKey1: '2nestedValue1', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(false);

        expect(
          resolveEntityValues(
            'endsWith',
            {
              key1: '2value1',
              key2: { nestedKey1: '2nestedValue1', nestedKey2: '2nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue23' },
              key3: '34'
            }
          )
        ).toBe(true);
      });
    });
  });

  describe('"notEndsWith" checkMode', () => {
    describe('actual: primitive, descriptor: primitive', () => {
      test('All primitive values should compare independent of their types', () => {
        expect(resolveEntityValues('notEndsWith', '312', 12)).toBe(false);
        expect(resolveEntityValues('notEndsWith', '1true', true)).toBe(false);
        expect(resolveEntityValues('notEndsWith', '1null', null)).toBe(false);
        expect(resolveEntityValues('notEndsWith', 'string', 'string')).toBe(false);
        expect(resolveEntityValues('notEndsWith', 'string', 'string2')).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: array', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('notEndsWith', '312', [11, 12, '13'])).toBe(false);
        expect(resolveEntityValues('notEndsWith', '12', [111, 133, '134'])).toBe(true);
      });
    });
    describe('actual: primitive, descriptor: object', () => {
      test('All primitive values should not be count as end of an object', () => {
        expect(resolveEntityValues('notEndsWith', 12, { key: '12' })).toBe(true);
        expect(resolveEntityValues('notEndsWith', true, { true: true })).toBe(true);
        expect(resolveEntityValues('notEndsWith', null, { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEndsWith', 'string', { key: 'value' })).toBe(true);
      });
    });

    describe('actual: array, descriptor: primitive', () => {
      test('Any array should not be count as end of primitive', () => {
        expect(resolveEntityValues('notEndsWith', [113, 1222, '312'], '12')).toBe(true);
        expect(resolveEntityValues('notEndsWith', [111, 133, '133'], '12')).toBe(true);
      });
    });
    describe('actual: array, descriptor: array', () => {
      test('Arrays with different length should be count as notEndsWith', () => {
        expect(resolveEntityValues('notEndsWith', ['true', '2'], [true, 2, 'string'])).toBe(true);
        expect(resolveEntityValues('notEndsWith', ['true', '2', 'string'], [true, 2])).toBe(true);
      });
      test('Arrays should be fully checked for "notEndsWith" with nested objects (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('notEndsWith', ['1true', '32', '12string'], [true, 2, 'string'])
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notEndsWith',
            [{ key1: '22value1', key2: '3111' }],
            [{ key2: 111, key1: 'value1' }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notEndsWith',
            [{ key1: '2value1', key2: '3value2' }],
            [{ key1: 'value1', key2: 'value2', key3: 'value3' }]
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'notEndsWith',
            [{ key1: '2value1', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
          )
        ).toBe(false);
        expect(
          resolveEntityValues(
            'notEndsWith',
            [{ key1: '2value1', key2: { nestedKey1: '2nestedValue1' } }],
            [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]
          )
        ).toBe(true);
      });
    });
    describe('actual: array, descriptor: object', () => {
      test('Any array should not be count as end of an object', () => {
        expect(resolveEntityValues('notEndsWith', [], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEndsWith', [true, 2, 'value'], { key: 'value' })).toBe(true);
        expect(resolveEntityValues('notEndsWith', [{ key: '33value' }], { key: 'value' })).toBe(
          true
        );
      });
    });

    describe('actual: object, descriptor: primitive', () => {
      test('Any object should not be count as ended with primitive', () => {
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, 12)).toBe(true);
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, true)).toBe(true);
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, null)).toBe(true);
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, 'string')).toBe(true);
      });
    });
    describe('actual: object, descriptor: array', () => {
      test('Should compare actual object value with every descriptor object value by "OR" logic', () => {
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, [])).toBe(true);
        expect(resolveEntityValues('notEndsWith', { key: 'value' }, [true, 2, 'string'])).toBe(
          true
        );
        expect(
          resolveEntityValues('notEndsWith', { key: '12value' }, [{ key: 'value', key2: 'value2' }])
        ).toBe(true);
        expect(resolveEntityValues('notEndsWith', { key: '12value' }, [{ key: 'value' }])).toBe(
          false
        );
        expect(
          resolveEntityValues('notEndsWith', { user: { phone: '99091230102' } }, [
            { user: { phone: '0' } },
            { user: { phone: '1' } }
          ])
        ).toBe(true);
        expect(
          resolveEntityValues('notEndsWith', { user: { phone: '99091230100' } }, [
            { user: { phone: '0' } },
            { user: { phone: '1' } }
          ])
        ).toBe(false);
      });
    });
    describe('actual: object, descriptor: object', () => {
      test('Plain objects should compare by "actualValue is strictly equals descriptorValue" with nested objects', () => {
        expect(
          resolveEntityValues(
            'notEndsWith',
            { key1: '2value1', key2: '3value2', key3: 'value34' },
            { key1: 'value1', key2: 'value2' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEndsWith',
            { key1: '2value1', key2: '3value2' },
            { key1: 'value1', key2: 'value2', key3: 'value3' }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEndsWith',
            {
              key1: '2value1',
              key2: { nestedKey1: '2nestedValue1', nestedKey2: 'nestedValue23' },
              key3: 'value34'
            },
            { key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }
          )
        ).toBe(true);

        expect(
          resolveEntityValues(
            'notEndsWith',
            {
              key1: '2value1',
              key2: { nestedKey1: '2nestedValue1', nestedKey2: '2nestedValue23' },
              key3: 'value34'
            },
            {
              key1: 'value1',
              key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue23' },
              key3: '34'
            }
          )
        ).toBe(false);
      });
    });
  });

  describe('"regExp" checkMode', () => {
    describe('actual: primitive, descriptor: regExp', () => {
      test('All primitive values should computed independent of their types', () => {
        expect(resolveEntityValues('regExp', 12, /^\d\d$/)).toBe(true);
        expect(resolveEntityValues('regExp', true, /^true$/)).toBe(true);
        expect(resolveEntityValues('regExp', null, /^null$/)).toBe(true);
        expect(resolveEntityValues('regExp', 'string12', /^string\d\d$/)).toBe(true);
        expect(resolveEntityValues('regExp', 'string2', /^string$/)).toBe(false);
      });
    });
    describe('actual: primitive, descriptor: regExpArray', () => {
      test('Should compare primitive actual value with every element in descriptor array value by "OR" logic', () => {
        expect(resolveEntityValues('regExp', '12', [/^11$/, /^12$/])).toBe(true);
        expect(resolveEntityValues('regExp', '12', [/^11$/, /^13$/])).toBe(false);
      });
    });

    describe('actual: array, descriptor: regExp', () => {
      test('Should compare every actual array element with regExp descriptor value by "OR" logic', () => {
        expect(resolveEntityValues('regExp', [11, 12, '12'], /^12$/)).toBe(true);
        expect(resolveEntityValues('regExp', [11, 13, '13'], /^12$/)).toBe(false);
      });
    });
    describe('actual: array, descriptor: regExpArray', () => {
      test('Arrays should be fully compared by corresponding regExp (independent of primitive values types)', () => {
        expect(
          resolveEntityValues('regExp', [true, 2, 'string'], [/^true$/, /^2$/, /^string$/])
        ).toBe(true);
        expect(
          resolveEntityValues('regExp', [true, 3, 'string'], [/^true$/, /^2$/, /^string$/])
        ).toBe(false);
      });
    });

    describe('actual: object, descriptor: regExp', () => {
      test('Any object should not be pass regExp check', () => {
        expect(resolveEntityValues('regExp', { key1: 'value1', key2: '111' }, /^\d\d\d$/)).toBe(
          false
        );
      });
    });
    describe('actual: object, descriptor: regExpArray', () => {
      test('Any object should not be pass regExp check', () => {
        expect(
          resolveEntityValues('regExp', { key1: 'value1', key2: '111' }, [/^\d\d\d$/, /^value\d$/])
        ).toBe(false);
      });
    });
  });

  describe('"function" checkMode', () => {
    describe('actual: primitive, descriptor: function', () => {
      test('Should support nested function calls using checkFunction', () => {
        expect(
          resolveEntityValues(
            'function',
            'string2',
            (actualValue: string, checkFunction: CheckFunction) =>
              checkFunction('function', actualValue, () => actualValue === 'string2')
          )
        ).toBe(true);
      });
      test('All primitive values should be count as first argument in descriptor function', () => {
        expect(
          resolveEntityValues('function', '12', (actualValue: string) => actualValue === '12')
        ).toBe(true);
        expect(resolveEntityValues('function', true, (actualValue: string) => actualValue)).toBe(
          true
        );
        expect(resolveEntityValues('function', null, (actualValue: string) => !actualValue)).toBe(
          true
        );
        expect(resolveEntityValues('function', 'string', () => true)).toBe(true);
      });
    });

    describe('actual: array, descriptor: function', () => {
      test('Any array should be count as first argument in descriptor function', () => {
        expect(
          resolveEntityValues(
            'function',
            ['true', '2'],
            ([first, second]: string[]) => first === 'true' && second === '2'
          )
        ).toBe(true);
        expect(
          resolveEntityValues(
            'function',
            [{ key1: 'value1' }, { key2: '111' }],
            (actualValue: Record<string, string>[]) =>
              actualValue[0].key1 === 'value1' && actualValue[1].key2 === '111'
          )
        ).toBe(true);
      });
    });

    describe('actual: object, descriptor: function', () => {
      test('Any object should be count as first argument in descriptor function', () => {
        expect(
          resolveEntityValues(
            'function',
            { key1: 'value1', key2: 'value2' },
            (actualValue: Record<string, string>) =>
              actualValue.key1 === 'value1' && actualValue.key2 === 'value2'
          )
        ).toBe(true);
      });
    });
  });
});
