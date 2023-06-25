import type { CompareWithExpectedValueCheckMode } from '@/utils/types';

import { validateRoutes } from './validateRoutes';

const generateCorrectCompareWithExpectedValueObjectEntity = (checkMode: CompareWithExpectedValueCheckMode) => ({
  [`${checkMode}1`]: { checkMode, value: true },
  [`${checkMode}2`]: { checkMode, value: 123 },
  [`${checkMode}3`]: { checkMode, value: 'string' },
  [`${checkMode}4`]: { checkMode, value: [true, 123, 'string'] }
});

const generateAllCorrectCompareWithExpectedValueObjectEntities = () => ({
  ...generateCorrectCompareWithExpectedValueObjectEntity('equals'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('notEquals'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('includes'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('notIncludes'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('startsWith'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('notStartsWith'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('endsWith'),
  ...generateCorrectCompareWithExpectedValueObjectEntity('notEndsWith'),
});

describe('validateRoutes (rest)', () => {
  test('Should correctly handle routes only with correct type', () => {
    expect(() => validateRoutes([{ data: null }], 'get')).not.toThrow(Error);

    const incorrectRouteArrayValues = ['string', true, 3000, null, undefined, {}, () => {}];
    incorrectRouteArrayValues.forEach((incorrectRouteArrayValue) => {
      expect(() => validateRoutes(incorrectRouteArrayValue, 'get')).toThrow(new Error('routes'));
    });

    const incorrectRouteValues = ['string', true, 3000, null, undefined, {}, [], () => {}];
    incorrectRouteValues.forEach((incorrectRouteValue) => {
      expect(() => validateRoutes([incorrectRouteValue], 'get')).toThrow(new Error('routes[0]'));
    });
  });

  test('Should correctly handle entities only with correct type', () => {
    const correctObjectEntity = {
      exists1: { checkMode: 'exists' },

      notExists1: { checkMode: 'notExists' },

      equals01: true,
      equals02: 123,
      equals03: 'string',
      ...generateAllCorrectCompareWithExpectedValueObjectEntities(),

      regExp1: { checkMode: 'regExp', value: /^value12$/ },
      regExp2: { checkMode: 'regExp', value: [/^value1$/, /^value2$/] },

      function1: { checkMode: 'function', value: (actualValue: string) => actualValue === 'value13' },
    }

    const correctObjectEntitiesValues = [
      {},
      {
        headers: correctObjectEntity,
        cookies: correctObjectEntity,
        params: correctObjectEntity,
        query: correctObjectEntity
      },
      undefined
    ];
    correctObjectEntitiesValues.forEach((correctObjectEntitiesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: correctObjectEntitiesValue,
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectEntitiesValues = ['string', true, 3000, null, [], () => {}];
    incorrectEntitiesValues.forEach((incorrectEntitiesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: incorrectEntitiesValue,
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities'));
    });
  });

  test('Should allow only correct descriptor checkModes', () => {
    expect(() =>
      validateRoutes(
        [
          {
            entities: {
              headers: {
                key1: {
                  checkMode: 'invalidCheckMode',
                  value: '123'
                }
              }
            },
            data: null
          }
        ],
        'get'
      )
    ).toThrow(new Error('routes[0].entities.headers.key1.checkMode'));
    expect(() =>
      validateRoutes(
        [
          {
            entities: {
              body: {
                checkMode: 'invalidCheckMode',
                value: {}
              }
            },
            data: null
          }
        ],
        'post'
      )
    ).toThrow(new Error('routes[0].entities.body.checkMode'));
  })

  test('Should allow only correct descriptor values', () => {
    const incorrectObjectEntityDescriptors = [
      { checkMode: 'exists', value: 'value2' },
      { checkMode: 'notExists', value: 'value3' },
      { checkMode: 'equals', value: () => {} },
      { checkMode: 'notEquals', value: /^123$/ },
      { checkMode: 'includes', value: null },
      { checkMode: 'notIncludes' },
      { checkMode: 'startsWith' },
      { checkMode: 'notStartsWith' },
      { checkMode: 'endsWith' },
      { checkMode: 'notEndsWith' },
      { checkMode: 'regExp', value: () => {} },
      { checkMode: 'function', value: {} },
    ];
    incorrectObjectEntityDescriptors.forEach((incorrectObjectEntityDescriptor) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                headers: {
                  key1: incorrectObjectEntityDescriptor
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).toThrow(new Error('routes[0].entities.headers.key1.value'));
    });

    expect(() =>
      validateRoutes(
        [
          {
            entities: {
              headers: {
                key1: { checkMode: 'equals', value: [() => {}] }
              }
            },
            data: null
          }
        ],
        'post'
      )
    ).toThrow(new Error('routes[0].entities.headers.key1.value[0]'));
    expect(() =>
      validateRoutes(
        [
          {
            entities: {
              headers: {
                key1: { checkMode: 'equals', value: [{}] }
              }
            },
            data: null
          }
        ],
        'post'
      )
    ).toThrow(new Error('routes[0].entities.headers.key1.value[0]'));

    expect(() =>
      validateRoutes(
        [
          {
            entities: {
              body: {
                checkMode: 'equals',
                value: () => {}
              }
            },
            data: null
          }
        ],
        'post'
      )
    ).toThrow(new Error('routes[0].entities.body.value'));
  });

  test('Should correctly handle get|delete|options method entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'params', 'query'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities() },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities() },
              data: null
            }
          ],
          'delete'
        )
      ).not.toThrow(Error);
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities() },
              data: null
            }
          ],
          'options'
        )
      ).not.toThrow(Error);
    });

    const incorrectEntities = ['body', 'other'];
    incorrectEntities.forEach((incorrectEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
              data: null
            }
          ],
          'delete'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle post|put|patch method entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'params', 'query'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities(),
                body: { key: 'value' }
              },
              data: null
            }
          ],
          'post'
        )
      ).not.toThrow(Error);
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities(),
                body: { key: 'value' }
              },
              data: null
            }
          ],
          'put'
        )
      ).not.toThrow(Error);
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [correctEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities(),
                body: { key: 'value' }
              },
              data: null
            }
          ],
          'patch'
        )
      ).not.toThrow(Error);
    });

    const incorrectEntities = ['other'];
    incorrectEntities.forEach((incorrectEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [incorrectEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities()
              },
              data: null
            }
          ],
          'post'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [incorrectEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities()
              },
              data: null
            }
          ],
          'put'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                [incorrectEntity]: generateAllCorrectCompareWithExpectedValueObjectEntities()
              },
              data: null
            }
          ],
          'patch'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle headers entity only with correct type', () => {
    const correctHeadersObjectValues = ['string', 3000, true];
    correctHeadersObjectValues.forEach((correctHeadersObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: { checkMode: 'equals', value: correctHeadersObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = [null, undefined, [], () => {}];
    incorrectHeadersValues.forEach((incorrectHeaderValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: incorrectHeaderValue },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.headers'));
    });

    const incorrectHeadersObjectValues = [null, undefined, {}, () => {}];
    incorrectHeadersObjectValues.forEach((incorrectHeadersObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: { checkMode: 'equals', value: incorrectHeadersObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.headers.key.value'));
    });
  });

  test('Should correctly handle cookies entity only with correct type', () => {
    const correctCookiesObjectValues = ['string', 3000, true];
    correctCookiesObjectValues.forEach((correctCookiesObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: { key: { checkMode: 'equals', value: correctCookiesObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectCookiesValues = ['string', true, 3000, null, undefined, [], () => {}];
    incorrectCookiesValues.forEach((incorrectCookieValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: incorrectCookieValue },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.cookies'));
    });

    const incorrectCookiesObjectValues = [null, undefined, {}, () => {}];
    incorrectCookiesObjectValues.forEach((incorrectCookiesObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: { key: { checkMode: 'equals', value: incorrectCookiesObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.cookies.key.value'));
    });
  });

  test('Should correctly handle params entity only with correct type', () => {
    const correctParamsObjectValues = ['string', 3000, true];
    correctParamsObjectValues.forEach((correctParamsObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: { checkMode: 'equals', value: correctParamsObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectParamsValues = ['string', true, 3000, null, undefined, [], () => {}];
    incorrectParamsValues.forEach((incorrectParamValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: incorrectParamValue },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.params'));
    });

    const incorrectParamsObjectValues = [null, undefined, {}, () => {}];
    incorrectParamsObjectValues.forEach((incorrectParamsObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: { checkMode: 'equals', value: incorrectParamsObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.params.key.value'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryObjectValues = ['value', ['value1', 'value2'], 3000, [3000, -3000], true, [true, false]];
    correctQueryObjectValues.forEach((correctQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: { checkMode: 'equals', value: correctQueryObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectQueryValues = ['string', true, 3000, null, undefined, [], () => {}];
    incorrectQueryValues.forEach((incorrectQueryValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: incorrectQueryValue },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query'));
    });

    const incorrectQueryObjectValues = [null, undefined, () => {}];
    incorrectQueryObjectValues.forEach((incorrectQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: { checkMode: 'equals', value: incorrectQueryObjectValue } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query.key.value'));
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: { checkMode: 'equals', value: [incorrectQueryObjectValue] } } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query.key.value[0]'));
    });
  });
});
