import { CHECK_MODES, PLAIN_ENTITY_CHECK_MODES } from '@/utils/constants';
import type { CompareWithDescriptorValueCheckMode, GraphQLEntityName } from '@/utils/types';

import { validateRoutes } from './validateRoutes';

const generateCorrectCompareWithDescriptorValueMappedEntity = (
  checkMode: CompareWithDescriptorValueCheckMode
) => ({
  [`${checkMode}-boolean`]: { checkMode, value: true },
  [`${checkMode}-number`]: { checkMode, value: 1 },
  [`${checkMode}-string`]: { checkMode, value: 'string' },
  [`${checkMode}-array`]: { checkMode, value: [true, 1, 'string'] }
});

const generateAllCorrectCompareWithExpectedValueMappedEntities = () => ({
  ...generateCorrectCompareWithDescriptorValueMappedEntity('equals'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('notEquals'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('includes'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('notIncludes'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('startsWith'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('notStartsWith'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('endsWith'),
  ...generateCorrectCompareWithDescriptorValueMappedEntity('notEndsWith')
});

describe('validateRoutes (graphql)', () => {
  test('Should correctly handle routes only with correct type', () => {
    expect(() => validateRoutes([{ data: null }], 'query')).not.toThrow(Error);

    const incorrectRouteArrayValues = ['string', true, 3000, null, undefined, {}, () => {}, /\d/];
    incorrectRouteArrayValues.forEach((incorrectRouteArrayValue) => {
      expect(() => validateRoutes(incorrectRouteArrayValue, 'query')).toThrow(new Error('routes'));
    });

    const incorrectRouteValues = ['string', true, 3000, null, undefined, {}, [], () => {}, /\d/];
    incorrectRouteValues.forEach((incorrectRouteValue) => {
      expect(() => validateRoutes([incorrectRouteValue], 'query')).toThrow(new Error('routes[0]'));
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

      'regExp-value': { checkMode: 'regExp', value: /^regExp$/ },
      'regExp-array': { checkMode: 'regExp', value: [/^regExp1$/, /^regExp2$/] },

      function: {
        checkMode: 'function',
        value: (actualValue: string) => actualValue === 'actualValue'
      }
    };

    const correctEntitiesValues = [
      {},
      {
        headers: correctMappedEntity,
        cookies: correctMappedEntity,
        query: correctMappedEntity
      },
      undefined
    ];
    correctEntitiesValues.forEach((correctEntitiesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: correctEntitiesValue,
              data: null
            }
          ],
          'query'
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities'));
    });
  });

  describe('Entity descriptors', () => {
    test('Should allow only correct descriptor checkModes for mapped entities', () => {
      const MAPPED_ENTITY_NAMES: Exclude<GraphQLEntityName, 'variables'>[] = [
        'headers',
        'cookies',
        'query'
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
            'query'
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
              'query'
            )
          ).not.toThrow(new Error(`routes[0].entities.${entityName}.checkMode`));
        });
      });
    });

    test('Should allow only correct descriptor checkModes for variables', () => {
      PLAIN_ENTITY_CHECK_MODES.forEach((checkMode) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: {
                  variables: {
                    checkMode,
                    value: {}
                  }
                },
                data: null
              }
            ],
            'query'
          )
        ).not.toThrow(new Error('routes[0].entities.variables.checkMode'));
      });
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  checkMode: 'invalidCheckMode',
                  value: {}
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.checkMode'));
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
            'query'
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
            'query'
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
            'query'
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
                  variables: incorrectPlainEntityValue
                },
                data: null
              }
            ],
            'query'
          )
        ).toThrow(new Error('routes[0].entities.variables'));
      });
    });

    test('Should allow flat object variables with descriptors', () => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  'a.b': 'value'
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(new Error('routes[0].entities.variables.a.b'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  a: {
                    checkMode: 'equals',
                    value: 'value'
                  }
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(new Error('routes[0].entities.variables.a'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  'a.b': {
                    checkMode: 'wrongCheckMode',
                    value: 'value'
                  }
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.a.b.checkMode'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  'a.b': /\d/
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.a.b'));

      expect(() =>
        validateRoutes(
          [
            {
              entities: {
                variables: {
                  'a.b': {
                    checkMode: 'equals'
                  }
                }
              },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.a.b.value'));
    });
  });

  test('Should correctly handle query operation type entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'query', 'variables'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: 'value' } },
              data: null
            }
          ],
          'query'
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
          'query'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle mutation operation type entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'query', 'variables'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: 'value' } },
              data: null
            }
          ],
          'mutation'
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
          'mutation'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle headers entity only with correct type', () => {
    const correctHeadersMappedValues = ['string'];
    correctHeadersMappedValues.forEach((correctHeadersMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: correctHeadersMappedValue } },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = [true, null, undefined, [], () => {}, /\d/];
    incorrectHeadersValues.forEach((incorrectHeaderValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: incorrectHeaderValue },
              data: null
            }
          ],
          'query'
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
          'query'
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
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectCookiesValues = [true, 3000, null, undefined, [], () => {}, /\d/];
    incorrectCookiesValues.forEach((incorrectCookieValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { cookies: incorrectCookieValue },
              data: null
            }
          ],
          'query'
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities.cookies.key'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryMappedValues = ['string', 3000, true];
    correctQueryMappedValues.forEach((correctQueryMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: correctQueryMappedValue } },
              data: null
            }
          ],
          'query'
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities.query'));
    });

    const incorrectQueryMappedValues = [null, undefined, {}, () => {}, /\d/];
    incorrectQueryMappedValues.forEach((incorrectQueryMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: incorrectQueryMappedValue } },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.query.key'));
    });
  });

  test('Should correctly handle route content only with polling setting', () => {
    const correctRouteMappedValues = [
      { data: null },
      { queue: [null], settings: { polling: true } }
    ];

    correctRouteMappedValues.forEach((correctRouteMappedValue) => {
      expect(() => validateRoutes([correctRouteMappedValue], 'query')).not.toThrow(Error);
    });

    const incorrectRouteMappedValues = [
      { queue: [null] },
      { queue: [null], settings: { polling: false } },
      { queue: null, settings: { polling: true } },
      { data: null, settings: { polling: true } }
    ];

    incorrectRouteMappedValues.forEach((incorrectRouteMappedValue) => {
      expect(() => validateRoutes([incorrectRouteMappedValue], 'query')).toThrow(
        new Error('routes[0]')
      );
    });
  });
});
