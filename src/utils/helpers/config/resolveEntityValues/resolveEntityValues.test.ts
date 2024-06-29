import type { CheckFunction, CheckMode } from '@/utils/types';

import { resolveEntityValues } from './resolveEntityValues';

describe('resolveEntityValues: oneOf', () => {
  test('Should return true with oneOf=true if at least one passed descriptor value matched to actual value', () => {
    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: [1, 2, 3],
        descriptorValue: [1, 2, 3],
        oneOf: true
      })
    ).toBe(false);

    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: [1, 2, 3],
        descriptorValue: [[1], [1, 2], [1, 2, 3]],
        oneOf: true
      })
    ).toBe(true);
  });

  test('Should return true with oneOf=false/undefined if full passed descriptor value matched to actual value', () => {
    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: [1, 2, 3],
        descriptorValue: [1, 2, 3]
      })
    ).toBe(true);

    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: [1, 2, 3],
        descriptorValue: [[1], [1, 2], [1, 2, 3]]
      })
    ).toBe(false);
  });
});

describe('resolveEntityValues: checkMode without descriptor value', () => {
  test('"exists"/"notExists" checkMode should return false/true only for undefined', () => {
    const existedValues = ['string', true, 3000, null, {}, [], () => {}, /\d/];
    existedValues.forEach((value) => {
      expect(resolveEntityValues({ checkMode: 'exists', actualValue: value })).toBe(true);
      expect(resolveEntityValues({ checkMode: 'notExists', actualValue: value })).toBe(false);
    });

    const nonExistedValues = [undefined];
    nonExistedValues.forEach((value) => {
      expect(resolveEntityValues({ checkMode: 'exists', actualValue: value })).toBe(false);
      expect(resolveEntityValues({ checkMode: 'notExists', actualValue: value })).toBe(true);
    });
  });
});

describe('resolveEntityValues: checkMode with descriptor value', () => {
  describe('"regExp" checkMode', () => {
    test('Should correctly test actual value against descriptor reg exp', () => {
      expect(
        resolveEntityValues({
          checkMode: 'regExp',
          actualValue: 'string',
          descriptorValue: /string/
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: 'regExp',
          actualValue: { property: 'string' },
          descriptorValue: /string/
        })
      ).toBe(false);
    });

    // ✅ important:
    // this is about https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/lastIndex#avoiding_side_effects
    test('Should be independent of reg exp "lastIndex" property when this reg exp using "g" flag', () => {
      const regExpWithGlobalFlag = /string/g;
      expect(
        resolveEntityValues({
          checkMode: 'regExp',
          actualValue: 'string',
          descriptorValue: regExpWithGlobalFlag
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: 'regExp',
          actualValue: 'string',
          descriptorValue: regExpWithGlobalFlag
        })
      ).toBe(true);
    });
  });

  describe('"function" checkMode', () => {
    test('Should define resolving result by descriptor function truthy/falsy return value', () => {
      expect(
        resolveEntityValues({
          checkMode: 'function',
          actualValue: 'primitive',
          descriptorValue: () => 'truthy'
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: 'function',
          actualValue: 'primitive',
          descriptorValue: () => ''
        })
      ).toBe(false);
    });

    test('Should call descriptor function with correct arguments', () => {
      const descriptorFn = vi.fn();
      resolveEntityValues({
        checkMode: 'function',
        actualValue: 'primitive',
        descriptorValue: descriptorFn
      });
      expect(descriptorFn).toBeCalledTimes(1);
      expect(descriptorFn).toBeCalledWith('primitive', expect.any(Function));
    });

    test('Should support nested function calls using checkFunction', () => {
      expect(
        resolveEntityValues({
          checkMode: 'function',
          actualValue: 'primitive',
          descriptorValue: (actualValue: string, checkFunction: CheckFunction) =>
            checkFunction('function', actualValue, () => actualValue === 'primitive')
        })
      ).toBe(true);
    });
  });

  test('Should compare values independent of their types', () => {
    const confirmationCheckModes = [
      'equals',
      'includes',
      'startsWith',
      'endsWith'
    ] satisfies CheckMode[];
    confirmationCheckModes.forEach((confirmationCheckMode) => {
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: '12',
          descriptorValue: 12
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: 'true',
          descriptorValue: true
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: 'string',
          descriptorValue: 'string'
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: 'null',
          descriptorValue: null
        })
      ).toBe(true);
    });

    const negationCheckModes = [
      'notEquals',
      'notIncludes',
      'notStartsWith',
      'notEndsWith'
    ] satisfies CheckMode[];
    negationCheckModes.forEach((negationCheckMode) => {
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: '12',
          descriptorValue: 12
        })
      ).toBe(false);
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: 'true',
          descriptorValue: true
        })
      ).toBe(false);
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: 'string',
          descriptorValue: 'string'
        })
      ).toBe(false);
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: 'null',
          descriptorValue: null
        })
      ).toBe(false);
    });
  });

  test('Should return false/true for confirmation/negation check modes when primitive and object are compared', () => {
    const confirmationCheckModes = [
      'equals',
      'includes',
      'startsWith',
      'endsWith'
    ] satisfies CheckMode[];
    confirmationCheckModes.forEach((confirmationCheckMode) => {
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: 'primitive',
          descriptorValue: ['primitive', { property: 'primitive' }]
        })
      ).toBe(false);
      expect(
        resolveEntityValues({
          checkMode: confirmationCheckMode,
          actualValue: ['primitive', { property: 'primitive' }],
          descriptorValue: 'primitive'
        })
      ).toBe(false);
    });

    const negationCheckModes = [
      'notEquals',
      'notIncludes',
      'notStartsWith',
      'notEndsWith'
    ] satisfies CheckMode[];
    negationCheckModes.forEach((negationCheckMode) => {
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: 'primitive',
          descriptorValue: ['primitive', { property: 'primitive' }]
        })
      ).toBe(true);
      expect(
        resolveEntityValues({
          checkMode: negationCheckMode,
          actualValue: ['primitive', { property: 'primitive' }],
          descriptorValue: 'primitive'
        })
      ).toBe(true);
    });
  });

  test('"equals"/"notEquals" checkMode should true/false when actual and descriptor values are equal', () => {
    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: 'primitive',
        descriptorValue: 'primitive'
      })
    ).toBe(true);
    expect(
      resolveEntityValues({
        checkMode: 'equals',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive', { property: 'primitive' }]
      })
    ).toBe(true);

    expect(
      resolveEntityValues({
        checkMode: 'notEquals',
        actualValue: 'primitive',
        descriptorValue: 'primitive'
      })
    ).toBe(false);
    expect(
      resolveEntityValues({
        checkMode: 'notEquals',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive', { property: 'primitive' }]
      })
    ).toBe(false);
  });

  test('"includes"/"notIncludes" checkMode should return true/false when actual value includes descriptor value', () => {
    expect(
      resolveEntityValues({
        checkMode: 'includes',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(1, 2)
      })
    ).toBe(true);
    expect(
      resolveEntityValues({
        checkMode: 'includes',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(1, 2), { property: 'primitive'.slice(1, 2) }]
      })
    ).toBe(true);

    expect(
      resolveEntityValues({
        checkMode: 'notIncludes',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(1, 2)
      })
    ).toBe(false);
    expect(
      resolveEntityValues({
        checkMode: 'notIncludes',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(1, 2), { property: 'primitive'.slice(1, 2) }]
      })
    ).toBe(false);
  });

  test('"startsWith"/"notStartsWith" checkMode should return true/false when actual value starts with descriptor value', () => {
    expect(
      resolveEntityValues({
        checkMode: 'startsWith',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(0, 2)
      })
    ).toBe(true);
    expect(
      resolveEntityValues({
        checkMode: 'startsWith',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(0, 2), { property: 'primitive'.slice(0, 2) }]
      })
    ).toBe(true);

    expect(
      resolveEntityValues({
        checkMode: 'notStartsWith',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(0, 2)
      })
    ).toBe(false);
    expect(
      resolveEntityValues({
        checkMode: 'notStartsWith',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(0, 2), { property: 'primitive'.slice(0, 2) }]
      })
    ).toBe(false);
  });

  test('"endsWith"/"notEndsWith" checkMode should return true/false when actual value ends with descriptor value', () => {
    expect(
      resolveEntityValues({
        checkMode: 'endsWith',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(1)
      })
    ).toBe(true);
    expect(
      resolveEntityValues({
        checkMode: 'endsWith',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(1), { property: 'primitive'.slice(1) }]
      })
    ).toBe(true);

    expect(
      resolveEntityValues({
        checkMode: 'notEndsWith',
        actualValue: 'primitive',
        descriptorValue: 'primitive'.slice(1)
      })
    ).toBe(false);
    expect(
      resolveEntityValues({
        checkMode: 'notEndsWith',
        actualValue: ['primitive', { property: 'primitive' }],
        descriptorValue: ['primitive'.slice(1), { property: 'primitive'.slice(1) }]
      })
    ).toBe(false);
  });
});
