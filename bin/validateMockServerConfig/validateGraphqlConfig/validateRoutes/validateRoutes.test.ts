import { validateRoutes } from './validateRoutes';

describe('validateRoutes (graphql)', () => {
  test('Should correctly handle routes only with correct type', () => {
    expect(() => validateRoutes([{ data: null }], 'query')).not.toThrow(Error);

    const incorrectRouteArrayValues = ['string', true, 3000, null, undefined, {}, () => {}];
    incorrectRouteArrayValues.forEach((incorrectRouteArrayValue) => {
      expect(() => validateRoutes(incorrectRouteArrayValue, 'query')).toThrow(new Error('routes'));
    });

    const incorrectRouteValues = ['string', true, 3000, null, undefined, {}, [], () => {}];
    incorrectRouteValues.forEach((incorrectRouteValue) => {
      expect(() => validateRoutes([incorrectRouteValue], 'query')).toThrow(new Error('routes[0]'));
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
          'query'
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities'));
    });
  });

  test('Should correctly handle query operation type entities only with correct type', () => {
    const correctEntities = ['headers', 'cookies', 'query', 'variables'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [correctEntity]: { key: { checkMode: 'equals', value: 'value' } } },
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
              entities: { [incorrectEntity]: { key: { checkMode: 'equals', value: 'value' } } },
              data: null
            }
          ],
          'mutation'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle headers entity only with correct type', () => {
    const correctHeadersObjectValues = ['string'];
    correctHeadersObjectValues.forEach((correctHeadersObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: { checkMode: 'equals', value: correctHeadersObjectValue } } },
              data: null
            }
          ],
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = [true, null, undefined, [], () => {}];
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
          'query'
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
          'query'
        )
      ).not.toThrow(Error);
    });

    const incorrectCookiesValues = [true, 3000, null, undefined, [], () => {}];
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities.cookies.key.value'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryObjectValues = ['string', 3000, true];
    correctQueryObjectValues.forEach((correctQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: { checkMode: 'equals', value: correctQueryObjectValue } } },
              data: null
            }
          ],
          'query'
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
          'query'
        )
      ).toThrow(new Error('routes[0].entities.query'));
    });

    const incorrectQueryObjectValues = [null, undefined, {}, () => {}];
    incorrectQueryObjectValues.forEach((incorrectQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: { checkMode: 'equals', value: incorrectQueryObjectValue } } },
              data: null
            }
          ],
          'query'
        )
      ).toThrow(new Error('routes[0].entities.query.key.value'));
    });
  });
});
