import { validateRoutes } from './validateRoutes';

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
    const correctEntitiesValues = [
      {},
      {
        headers: {
          key: { checkMode: 'equals', value: true }
        },
        cookies: {
          key: { checkMode: 'equals', value: 3000 }
        },
        query: {
          key: { checkMode: 'equals', value: 'value' }
        }
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

  test('Should correctly handle get|delete|options method entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'params', 'query'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
    const correctEntities = ['headers', 'cookies', 'params', 'query', 'body'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
