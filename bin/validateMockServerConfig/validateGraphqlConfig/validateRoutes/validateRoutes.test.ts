import {
  CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES,
  PLAIN_ENTITY_CHECK_MODES
} from '@/utils/constants';
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

const generateAllCorrectCompareWithExpectedValueMappedEntities = () =>
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES.reduce(
    (acc, checkMode) => ({
      ...acc,
      ...generateCorrectCompareWithDescriptorValueMappedEntity(checkMode)
    }),
    {}
  );

describe('validateRoutes (graphql)', () => {
  describe('validateRoutes (graphql): validate routes and entities types', () => {
    test('Should correctly handle routes only with correct type', () => {
      const correctRoutesValues = [[]];
      correctRoutesValues.forEach((correctRouteValue) => {
        expect(() => validateRoutes(correctRouteValue, 'query')).not.toThrow(Error);
      });

      const incorrectRoutesValues = ['string', true, 3000, null, undefined, {}, () => {}, /\d/];
      incorrectRoutesValues.forEach((incorrectRoutesValue) => {
        expect(() => validateRoutes(incorrectRoutesValue, 'query')).toThrow(new Error('routes'));
      });

      const correctRouteElementValues = [{ data: null }];
      correctRouteElementValues.forEach((correctRouteElementValue) => {
        expect(() => validateRoutes([correctRouteElementValue], 'query')).not.toThrow(Error);
      });

      const incorrectRouteElementValues = [
        'string',
        true,
        3000,
        null,
        undefined,
        {},
        [],
        () => {},
        /\d/
      ];
      incorrectRouteElementValues.forEach((incorrectRouteElementValue) => {
        expect(() => validateRoutes([incorrectRouteElementValue], 'query')).toThrow(
          new Error('routes[0]')
        );
      });
    });

    test('Should correctly handle entities only with correct type', () => {
      const correctEntitiesValues = [{}, undefined];
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

    test('Should correctly handle query|mutation operation type only with correct entities', () => {
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

      const incorrectEntities = ['other'];
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

    test('Should correctly handle variables entity (plain entities) only with correct type', () => {
      const correctVariablesValues = [[], {}];
      correctVariablesValues.forEach((correctVariablesValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: correctVariablesValue },
                data: null
              }
            ],
            'query'
          )
        ).not.toThrow(Error);
      });

      const incorrectVariablesValues = ['string', 3000, true, null, undefined, () => {}, /\d/];
      incorrectVariablesValues.forEach((incorrectVariablesValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: incorrectVariablesValue },
                data: null
              }
            ],
            'query'
          )
        ).toThrow(new Error('routes[0].entities.variables'));
      });

      const correctVariablesObjectPropertyValues = [{}, [], 'string', 3000, true, null];
      correctVariablesObjectPropertyValues.forEach((correctVariablesObjectPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: { key: correctVariablesObjectPropertyValue } },
                data: null
              }
            ],
            'query'
          )
        ).not.toThrow(Error);
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: { key: [correctVariablesObjectPropertyValue] } },
                data: null
              }
            ],
            'query'
          )
        ).not.toThrow(Error);
      });

      const incorrectVariablesObjectPropertyValues = [undefined, () => {}, /\d/];
      incorrectVariablesObjectPropertyValues.forEach((incorrectVariablesObjectPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: { key: incorrectVariablesObjectPropertyValue } },
                data: null
              }
            ],
            'query'
          )
        ).toThrow(new Error('routes[0].entities.variables.key'));
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: { key: [incorrectVariablesObjectPropertyValue] } },
                data: null
              }
            ],
            'query'
          )
        ).toThrow(new Error('routes[0].entities.variables.key[0]'));
      });

      const correctVariablesArrayPropertyValues = [{}, []];
      correctVariablesArrayPropertyValues.forEach((correctVariablesArrayPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: [correctVariablesArrayPropertyValue] },
                data: null
              }
            ],
            'query'
          )
        ).not.toThrow(Error);
      });

      const incorrectVariablesArrayPropertyValues = [
        'string',
        3000,
        true,
        null,
        undefined,
        () => {},
        /\d/
      ];
      incorrectVariablesArrayPropertyValues.forEach((incorrectVariablesArrayPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { variables: [incorrectVariablesArrayPropertyValue] },
                data: null
              }
            ],
            'query'
          )
        ).toThrow(new Error('routes[0].entities.variables[0]'));
      });
    });

    test('Should correctly handle headers|cookies|query entity (mapped entities) only with correct type', () => {
      const entities = ['headers', 'cookies', 'query'];
      entities.forEach((entity) => {
        const correctEntityValues = [{}];
        correctEntityValues.forEach((correctEntityValue) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: correctEntityValue },
                  data: null
                }
              ],
              'query'
            )
          ).not.toThrow(Error);
        });

        const incorrectEntityValues = ['string', true, 3000, null, undefined, [], () => {}, /\d/];
        incorrectEntityValues.forEach((incorrectEntityValue) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: incorrectEntityValue },
                  data: null
                }
              ],
              'query'
            )
          ).toThrow(new Error(`routes[0].entities.${entity}`));
        });

        const correctEntityPropertyValues = ['string', 3000, true, null];
        correctEntityPropertyValues.forEach((correctEntityPropertyValue) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: { key: correctEntityPropertyValue } },
                  data: null
                }
              ],
              'query'
            )
          ).not.toThrow(Error);
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: { key: [correctEntityPropertyValue] } },
                  data: null
                }
              ],
              'query'
            )
          ).not.toThrow(Error);
        });

        const incorrectEntityPropertyValues = [undefined, {}, () => {}, /\d/];
        incorrectEntityPropertyValues.forEach((incorrectEntityPropertyValue) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: { key: incorrectEntityPropertyValue } },
                  data: null
                }
              ],
              'query'
            )
          ).toThrow(new Error(`routes[0].entities.${entity}.key`));
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [entity]: { key: [incorrectEntityPropertyValue] } },
                  data: null
                }
              ],
              'query'
            )
          ).toThrow(new Error(`routes[0].entities.${entity}.key[0]`));
        });
      });
    });
  });

  test('Should correctly handle variables entity only with correct type', () => {
    const correctVariablesValues = [[], {}];
    correctVariablesValues.forEach((correctVariablesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: correctVariablesValue },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectVariablesValues = ['string', 3000, true, null, undefined, () => {}, /\d/];
    incorrectVariablesValues.forEach((incorrectVariablesValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: incorrectVariablesValue },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables'));
    });

    const correctVariablesMappedValues = [{}, [], 'string', 3000, true, null];
    correctVariablesMappedValues.forEach((correctVariablesMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: { key: correctVariablesMappedValue } },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(Error);
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: { key: [correctVariablesMappedValue] } },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectVariablesMappedValues = [undefined, () => {}, /\d/];
    incorrectVariablesMappedValues.forEach((incorrectVariablesMappedValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: { key: incorrectVariablesMappedValue } },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.key'));
      expect(() =>
        validateRoutes(
          [
            {
              entities: { variables: { key: [incorrectVariablesMappedValue] } },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.variables.key[0]'));
    });
  });

  describe('validateRoutes (graphql): entity descriptors', () => {
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
    });

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

      const incorrectMappedEntityValues = [undefined, {}, () => {}, /\d/];
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

  describe('Polling', () => {
    test('Should correctly handle route content only with polling setting', () => {
      const correctRouteMappedValues = [
        { data: null },
        { data: null, settings: { polling: false } },
        { queue: [], settings: { polling: true } }
      ];
      correctRouteMappedValues.forEach((correctRouteMappedValue) => {
        expect(() => validateRoutes([correctRouteMappedValue], 'query')).not.toThrow(Error);
      });

      const incorrectRouteMappedValues = [{}, { data: null, queue: null }];
      incorrectRouteMappedValues.forEach((incorrectRouteMappedValue) => {
        expect(() => validateRoutes([incorrectRouteMappedValue], 'query')).toThrow(
          new Error('routes[0]')
        );
      });

      const incorrectSettingsRouteMappedValue = { queue: [] };
      expect(() => validateRoutes([incorrectSettingsRouteMappedValue], 'query')).toThrow(
        new Error('routes[0].settings')
      );

      const incorrectSettingPollingRouteMappedValues = [
        {
          queue: [],
          settings: { polling: false }
        },
        { data: null, settings: { polling: true } }
      ];
      incorrectSettingPollingRouteMappedValues.forEach(
        (incorrectSettingPollingRouteMappedValue) => {
          expect(() => validateRoutes([incorrectSettingPollingRouteMappedValue], 'query')).toThrow(
            new Error('routes[0].settings.polling')
          );
        }
      );
    });
  });
});
