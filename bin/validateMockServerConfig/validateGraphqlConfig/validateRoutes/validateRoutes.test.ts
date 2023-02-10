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
    const correctEntitiesValues = [{}, { headers: { key: 'value' } }, undefined];
    correctEntitiesValues.forEach((correctEntitiesValue) => {
      expect(() => validateRoutes([
        {
          entities: correctEntitiesValue,
          data: null
        }
      ], 'query')).not.toThrow(Error);
    });

    const incorrectEntitiesValues = ['string', true, 3000, null, [], () => {}];
    incorrectEntitiesValues.forEach((incorrectEntitiesValue) => {
      expect(() => validateRoutes([
        {
          entities: incorrectEntitiesValue,
          data: null
        }
      ], 'query')).toThrow(new Error('routes[0].entities'));
    });
  });

  test('Should correctly handle query operation type entities only with correct type', () => {
    const correctEntities = ['headers', 'query', 'variables'];
    correctEntities.forEach((correctEntity) => {
      expect(() => validateRoutes([
        {
          entities: { [correctEntity]: { key: 'value' } },
          data: null
        }
      ], 'query')).not.toThrow(Error);
    });

    const incorrectEntities = ['body', 'other'];
    incorrectEntities.forEach((incorrectEntity) => {
      expect(() => validateRoutes([
        {
          entities: { [incorrectEntity]: { key: 'value' } },
          data: null
        }
      ], 'query')).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle mutation operation type entities only with correct type', () => {
    const correctEntities = ['headers', 'query', 'variables'];
    correctEntities.forEach((correctEntity) => {
      expect(() => validateRoutes([
        {
          entities: { [correctEntity]: { key: 'value' } },
          data: null
        }
      ], 'mutation')).not.toThrow(Error);
    });

    const incorrectEntities = ['body', 'other'];
    incorrectEntities.forEach((incorrectEntity) => {
      expect(() => validateRoutes([
        {
          entities: { [incorrectEntity]: { key: 'value' } },
          data: null
        }
      ], 'mutation')).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle headers entity only with correct type', () => {
    const correctHeadersObjectValues = ['string'];
    correctHeadersObjectValues.forEach((correctHeadersObjectValue) => {
      expect(() => validateRoutes([
        {
          entities: { headers: { key: correctHeadersObjectValue } },
          data: null
        }
      ], 'query')).not.toThrow(Error);
    });

    const incorrectHeadersValues = [true, 3000, null, undefined, [], () => {}];
    incorrectHeadersValues.forEach((incorrectHeaderValue) => {
      expect(() => validateRoutes([
        {
          entities: { headers: incorrectHeaderValue },
          data: null
        }
      ], 'query')).toThrow(new Error('routes[0].entities.headers'));
    });

    const incorrectHeadersObjectValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectHeadersObjectValues.forEach((incorrectHeadersObjectValue) => {
      expect(() => validateRoutes([
        {
          entities: { headers: { key: incorrectHeadersObjectValue } },
          data: null
        }
      ], 'query')).toThrow(new Error('routes[0].entities.headers.key'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryObjectValues = ['string'];
    correctQueryObjectValues.forEach((correctQueryObjectValue) => {
      expect(() => validateRoutes([
        {
          entities: { query: { key: correctQueryObjectValue } },
          data: null
        }
      ], 'query')).not.toThrow(Error);
    });

    const incorrectQueryValues = ['string', true, 3000, null, undefined, [], () => {}];
    incorrectQueryValues.forEach((incorrectQueryValue) => {
      expect(() => validateRoutes([
        {
          entities: { query: incorrectQueryValue },
          data: null
        }
      ], 'query')).toThrow(new Error('routes[0].entities.query'))
    });

    const incorrectQueryObjectValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectQueryObjectValues.forEach((incorrectQueryObjectValue) => {
      expect(() => validateRoutes([
        {
          entities: { query: { key: incorrectQueryObjectValue } },
          data: null
        }
      ], 'query')).toThrow(new Error('routes[0].entities.query.key'))
    })
  });
});
