import {
  CHECK_MODES,
  COMPARE_WITH_DESCRIPTOR_VALUE_CHECK_MODES,
  PLAIN_ENTITY_CHECK_MODES
} from '@/utils/constants';
import type { CompareWithDescriptorValueCheckMode, RestEntityName } from '@/utils/types';

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

describe('validateRoutes (rest)', () => {
  describe('validateRoutes (rest): validate routes and entities types', () => {
    test('Should correctly handle routes only with correct type', () => {
      const correctRoutesValues = [[]];
      correctRoutesValues.forEach((correctRouteValue) => {
        expect(() => validateRoutes(correctRouteValue, 'get')).not.toThrow(Error);
      });

      const incorrectRoutesValues = ['string', true, 3000, null, undefined, {}, () => {}, /\d/];
      incorrectRoutesValues.forEach((incorrectRoutesValue) => {
        expect(() => validateRoutes(incorrectRoutesValue, 'get')).toThrow(new Error('routes'));
      });

      const correctRouteElementValues = [{ data: null }];
      correctRouteElementValues.forEach((correctRouteElementValue) => {
        expect(() => validateRoutes([correctRouteElementValue], 'get')).not.toThrow(Error);
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
        expect(() => validateRoutes([incorrectRouteElementValue], 'get')).toThrow(
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

    test('Should correctly handle get|delete|options method (methods without body) only with correct entities', () => {
      const methods = ['get', 'delete', 'options'] as const;
      const correctEntities = ['headers', 'cookies', 'params', 'query'];
      const incorrectEntities = ['body', 'other'];

      methods.forEach((method) => {
        correctEntities.forEach((correctEntity) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [correctEntity]: { key: 'value' } },
                  data: null
                }
              ],
              method
            )
          ).not.toThrow(Error);
        });
        incorrectEntities.forEach((incorrectEntity) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [incorrectEntity]: { key: 'value' } },
                  data: null
                }
              ],
              method
            )
          ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
        });
      });
    });

    test('Should correctly handle post|put|patch method (methods with body) only with correct entities', () => {
      const methods = ['post', 'put', 'patch'] as const;
      const correctEntities = ['headers', 'cookies', 'params', 'query', 'body'];
      const incorrectEntities = ['other'];

      methods.forEach((method) => {
        correctEntities.forEach((correctEntity) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [correctEntity]: { key: 'value' } },
                  data: null
                }
              ],
              method
            )
          ).not.toThrow(Error);
        });
        incorrectEntities.forEach((incorrectEntity) => {
          expect(() =>
            validateRoutes(
              [
                {
                  entities: { [incorrectEntity]: { key: 'value' } },
                  data: null
                }
              ],
              method
            )
          ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
        });
      });
    });

    test('Should correctly handle body entity (plain entities) only with correct type', () => {
      const correctBodyValues = [[], {}];
      correctBodyValues.forEach((correctBodyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: correctBodyValue },
                data: null
              }
            ],
            'post'
          )
        ).not.toThrow(Error);
      });

      const incorrectBodyValues = ['string', 3000, true, null, undefined, () => {}, /\d/];
      incorrectBodyValues.forEach((incorrectBodyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: incorrectBodyValue },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.body'));
      });

      const correctBodyObjectPropertyValues = [{}, [], 'string', 3000, true, null];
      correctBodyObjectPropertyValues.forEach((correctBodyObjectPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: { key: correctBodyObjectPropertyValue } },
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
                entities: { body: { key: [correctBodyObjectPropertyValue] } },
                data: null
              }
            ],
            'post'
          )
        ).not.toThrow(Error);
      });

      const incorrectBodyObjectPropertyValues = [undefined, () => {}, /\d/];
      incorrectBodyObjectPropertyValues.forEach((incorrectBodyObjectPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: { key: incorrectBodyObjectPropertyValue } },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.body.key'));
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: { key: [incorrectBodyObjectPropertyValue] } },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.body.key[0]'));
      });

      const correctBodyArrayPropertyValues = [{}, []];
      correctBodyArrayPropertyValues.forEach((correctBodyArrayPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: [correctBodyArrayPropertyValue] },
                data: null
              }
            ],
            'post'
          )
        ).not.toThrow(Error);
      });

      const incorrectBodyArrayPropertyValues = [
        'string',
        3000,
        true,
        null,
        undefined,
        () => {},
        /\d/
      ];
      incorrectBodyArrayPropertyValues.forEach((incorrectBodyArrayPropertyValue) => {
        expect(() =>
          validateRoutes(
            [
              {
                entities: { body: [incorrectBodyArrayPropertyValue] },
                data: null
              }
            ],
            'post'
          )
        ).toThrow(new Error('routes[0].entities.body[0]'));
      });
    });

    test('Should correctly handle headers|cookies|params|query entity (mapped entities) only with correct type', () => {
      const entities = ['headers', 'cookies', 'params', 'query'];

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
              'get'
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
              'get'
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
              'get'
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
              'get'
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
              'get'
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
              'get'
            )
          ).toThrow(new Error(`routes[0].entities.${entity}.key[0]`));
        });
      });
    });
  });

  describe('validateRoutes(rest): entity descriptors', () => {
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
    });

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
});
