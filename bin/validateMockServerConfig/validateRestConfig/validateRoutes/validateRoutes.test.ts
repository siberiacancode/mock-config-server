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
    const correctEntitiesValues = [{}, { headers: { key: 'value' } }, undefined];
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
    const correctEntities = ['headers', 'cookies', 'params', 'query', 'body'];
    correctEntities.forEach((correctEntity) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [correctEntity]: { key: 'value' } },
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
              entities: { [incorrectEntity]: { key: 'value' } },
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
              entities: { [incorrectEntity]: { key: 'value' } },
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
              entities: { [incorrectEntity]: { key: 'value' } },
              data: null
            }
          ],
          'patch'
        )
      ).toThrow(new Error(`routes[0].entities.${incorrectEntity}`));
    });
  });

  test('Should correctly handle headers entity only with correct type', () => {
    const correctHeadersObjectValues = ['value'];
    correctHeadersObjectValues.forEach((correctHeadersObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: correctHeadersObjectValue } },
              data: null
            }
          ],
          'get'
        )
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = ['string', true, 3000, null, undefined, [], () => {}];
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

    const incorrectHeadersObjectValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectHeadersObjectValues.forEach((incorrectHeadersObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { headers: { key: incorrectHeadersObjectValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.headers.key'));
    });
  });

  test('Should correctly handle params entity only with correct type', () => {
    const correctParamsObjectValues = ['value'];
    correctParamsObjectValues.forEach((correctParamsObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: correctParamsObjectValue } },
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

    const incorrectParamsObjectValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectParamsObjectValues.forEach((incorrectParamsObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { params: { key: incorrectParamsObjectValue } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.params.key'));
    });
  });

  test('Should correctly handle query entity only with correct type', () => {
    const correctQueryObjectValues = ['value', ['value1', 'value2']];
    correctQueryObjectValues.forEach((correctQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: correctQueryObjectValue } },
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

    const incorrectQueryObjectValues = [true, 3000, null, undefined, () => {}];
    incorrectQueryObjectValues.forEach((incorrectQueryObjectValue) => {
      expect(() =>
        validateRoutes(
          [
            {
              entities: { query: { key: incorrectQueryObjectValue } },
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
              entities: { query: { key: [incorrectQueryObjectValue] } },
              data: null
            }
          ],
          'get'
        )
      ).toThrow(new Error('routes[0].entities.query.key[0]'));
    });
  });
});
