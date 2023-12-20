import { CHECK_MODES, PLAIN_ENTITY_CHECK_MODES } from '@/utils/constants';
import type { CompareWithDescriptorValueCheckMode, RestEntityName } from '@/utils/types';

import { validateRoutes } from './validateRoutes';

const generateCorrectCompareWithDescriptorMappedEntity = (
  checkMode: CompareWithDescriptorValueCheckMode
) => ({
  [`${checkMode}-boolean`]: { checkMode, value: true },
  [`${checkMode}-number`]: { checkMode, value: 1 },
  [`${checkMode}-string`]: { checkMode, value: 'string' },
  [`${checkMode}-array`]: { checkMode, value: [true, 1, 'string'] }
});

const generateAllCorrectCompareWithExpectedValueMappedEntities = () => ({
  ...generateCorrectCompareWithDescriptorMappedEntity('equals'),
  ...generateCorrectCompareWithDescriptorMappedEntity('notEquals'),
  ...generateCorrectCompareWithDescriptorMappedEntity('includes'),
  ...generateCorrectCompareWithDescriptorMappedEntity('notIncludes'),
  ...generateCorrectCompareWithDescriptorMappedEntity('startsWith'),
  ...generateCorrectCompareWithDescriptorMappedEntity('notStartsWith'),
  ...generateCorrectCompareWithDescriptorMappedEntity('endsWith'),
  ...generateCorrectCompareWithDescriptorMappedEntity('notEndsWith')
});

describe('validateRoutes (rest)', () => {
  test('Should correctly handle routes only with correct type', () => {
    expect(() => validateRoutes([{ data: null }], 'get')).not.toThrow(Error);

    const incorrectRouteArrayValues = ['string', true, 3000, null, undefined, {}, () => {}, /\d/];
    incorrectRouteArrayValues.forEach((incorrectRouteArrayValue) => {
      expect(() => validateRoutes(incorrectRouteArrayValue, 'get')).toThrow(new Error('routes'));
    });

    const incorrectRouteValues = ['string', true, 3000, null, undefined, {}, [], () => {}, /\d/];
    incorrectRouteValues.forEach((incorrectRouteValue) => {
      expect(() => validateRoutes([incorrectRouteValue], 'get')).toThrow(new Error('routes[0]'));
    });
  });

  test('Should correctly handle entities only with correct type', () => {
    const correctMappedEntity = {
      exists: { checkMode: 'exists' },

      notExists: { checkMode: 'notExists' },

      'equals-plain-boolean': true,
      'equals-plain-number': 1,
      'equals-plain-string': 'string',
      'equals-plain-array': [true, 1, 'string'],
      ...generateAllCorrectCompareWithExpectedValueMappedEntities(),

      'regExp-value': { checkMode: 'regExp', value: /^regExp/ },
      'regExp-array': { checkMode: 'regExp', value: [/^regExp1$/, /^regExp2$/] },

      function: {
        checkMode: 'function',
        value: (actualValue: string) => actualValue === 'actualValue'
      }
    };

    const correctMappedEntitiesValues = [
      {},
      {
        headers: correctMappedEntity,
        cookies: correctMappedEntity,
        params: correctMappedEntity,
        query: correctMappedEntity
      },
      undefined
    ];
    correctMappedEntitiesValues.forEach((correctMappedEntitiesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: correctMappedEntitiesValue,
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectEntitiesValues = ['string', true, 3000, null, [], () => {}, /\d/];
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

  describe('Entity descriptors', () => {
    test('Should allow only correct descriptor checkModes for mapped entities', () => {
      const MAPPED_ENTITY_NAMES: Exclude<RestEntityName, 'body'>[] = [
        'headers',
        'cookies',
        'query',
        'params'
      ];
      MAPPED_ENTITY_NAMES.forEach((entityName) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  [entityName]: {
                    key1: {
                      checkMode: 'invalidCheckMode',
                      value: 'value'
                    }
                  }
                },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error(`routes[0].entities.${entityName}.key1.checkMode`));
        CHECK_MODES.forEach((checkMode) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: {
                    [entityName]: {
                      checkMode,
                      value: 'value'
                    }
                  },
                  data: null
                }
              ],
              'post'
            )
          ).not.toThrow(new Error(`routes[0].entities.${entityName}.checkMode`));
        });
      });
    });

    test('Should allow only correct descriptor checkModes for body', () => {
      PLAIN_ENTITY_CHECK_MODES.forEach((checkMode) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  body: {
                    checkMode,
                    value: {}
                  }
                },
                data: null
              }
            ],
            'post'
          )
        ).not.toThrow(new Error('routes[0].entities.body.checkMode'));
      });
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
    });

    test('Should allow only correct descriptor values', () => {
      const incorrectMappedEntityDescriptors = [
        { checkMode: 'exists', value: 'exists' },
        { checkMode: 'notExists', value: 'notExists' },
        { checkMode: 'equals', value: () => {} },
        { checkMode: 'notEquals', value: /\d/ },
        { checkMode: 'includes', value: null },
        { checkMode: 'notIncludes' },
        { checkMode: 'startsWith' },
        { checkMode: 'notStartsWith' },
        { checkMode: 'endsWith' },
        { checkMode: 'notEndsWith' },
        { checkMode: 'regExp', value: () => {} },
        { checkMode: 'function', value: {} }
      ];
      incorrectMappedEntityDescriptors.forEach((incorrectMappedEntityDescriptor) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  headers: {
                    key: incorrectMappedEntityDescriptor
                  }
                },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.headers.key.value'));
      });

      const incorrectMappedEntityValues = [null, {}, () => {}, /\d/];
      incorrectMappedEntityValues.forEach((incorrectMappedEntityValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  headers: {
                    key: incorrectMappedEntityValue
                  }
                },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.headers.key'));
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  headers: {
                    key: [incorrectMappedEntityValue]
                  }
                },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.headers.key[0]'));
      });

      const incorrectPlainEntityValues = [null, () => {}, /\d/];
      incorrectPlainEntityValues.forEach((incorrectPlainEntityValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  body: incorrectPlainEntityValue
                },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.body'));
      });
    });

    test('Should allow flat object body with descriptors', () => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                body: {
                  'a.b': 'value'
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).not.toThrow(new Error('routes[0].entities.body.a.b'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                body: {
                  a: {
                    checkMode: 'equals',
                    value: 'value'
                  }
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).not.toThrow(new Error('routes[0].entities.body.a'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                body: {
                  'a.b': {
                    checkMode: 'wrongCheckMode',
                    value: 'value'
                  }
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).toThrow(new Error('routes[0].entities.body.a.b.checkMode'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                body: {
                  'a.b': /\d/
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).toThrow(new Error('routes[0].entities.body.a.b'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                body: {
                  'a.b': {
                    checkMode: 'equals'
                  }
                }
              },
              data: null
            }
          ],
          'post'
        )
      ).toThrow(new Error('routes[0].entities.body.a.b.value'));
    });
  });

  test('Should correctly handle get|delete|options method entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'params', 'query'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [incorrectEntity]: { key: 'value' } },
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
              entities: { [incorrectEntity]: { key: 'value' } },
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
                [correctEntity]: { key: 'value' },
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
                [correctEntity]: { key: 'value' },
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
                [correctEntity]: { key: 'value' },
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
                [incorrectEntity]: { key: 'value' }
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
                [incorrectEntity]: { key: 'value' }
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
                [incorrectEntity]: { key: 'value' }
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
    const correctHeadersMappedValues = ['string', 3000, true];
    correctHeadersMappedValues.forEach((correctHeadersMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: correctHeadersMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = [null, undefined, [], () => {}, /\d/];
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

    const incorrectHeadersMappedValues = [null, undefined, {}, () => {}, /\d/];
    incorrectHeadersMappedValues.forEach((incorrectHeadersMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: incorrectHeadersMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.headers.key'));
    });
  });

  test('Should correctly handle cookies entity only with correct type', () => {
    const correctCookiesMappedValues = ['string', 3000, true];
    correctCookiesMappedValues.forEach((correctCookiesMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: { key: correctCookiesMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectCookiesValues = ['string', true, 3000, null, undefined, [], () => {}, /\d/];
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

    const incorrectCookiesMappedValues = [null, undefined, {}, () => {}, /\d/];
    incorrectCookiesMappedValues.forEach((incorrectCookiesMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: { key: incorrectCookiesMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.cookies.key'));
    });
  });

  test('Should correctly handle params entity only with correct type', () => {
    const correctParamsMappedValues = ['string', 3000, true];
    correctParamsMappedValues.forEach((correctParamsMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: correctParamsMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectParamsValues = ['string', true, 3000, null, undefined, [], () => {}, /\d/];
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

    const incorrectParamsMappedValues = [null, undefined, {}, () => {}, /\d/];
    incorrectParamsMappedValues.forEach((incorrectParamsMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: incorrectParamsMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.params.key'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryMappedValues = [
      'string',
      ['string1', 'string2'],
      3000,
      [3000, -3000],
      true,
      [true, false]
    ];
    correctQueryMappedValues.forEach((correctQueryMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: correctQueryMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectQueryValues = ['string', true, 3000, null, undefined, [], () => {}, /\d/];
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

    const incorrectQueryMappedValues = [null, undefined, () => {}, /\d/];
    incorrectQueryMappedValues.forEach((incorrectQueryMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: incorrectQueryMappedValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query.key'));
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: [incorrectQueryMappedValue] } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query.key[0]'));
    });
  });

  test('Should correctly handle route content only with polling setting', () => {
    const correctRouteMappedValues = [
      { data: null },
      { queue: [], settings: { polling: true } },
      { data: null, settings: { polling: false } }
    ];
    correctRouteMappedValues.forEach((correctRouteMappedValue) => {
      expect(() => validateRoutes([correctRouteMappedValue], 'get')).not.toThrow(Error);
    });

    const incorrectRouteMappedValues = [{}, { data: null, queue: null }];
    incorrectRouteMappedValues.forEach((incorrectRouteMappedValue) => {
      expect(() => validateRoutes([incorrectRouteMappedValue], 'get')).toThrow(
        new Error('routes[0]')
      );
    });

    const incorrectSettingsRouteMappedValue = { queue: [] };
    expect(() => validateRoutes([incorrectSettingsRouteMappedValue], 'get')).toThrow(
      new Error('routes[0].settings')
    );

    const incorrectSettingPollingRouteMappedValues = [
      {
        queue: [],
        settings: { polling: false }
      },
      { data: null, settings: { polling: true } }
    ];
    incorrectSettingPollingRouteMappedValues.forEach((incorrectSettingPollingRouteMappedValue) => {
      expect(() => validateRoutes([incorrectSettingPollingRouteMappedValue], 'get')).toThrow(
        new Error('routes[0].settings.polling')
      );
    });
  });
});
