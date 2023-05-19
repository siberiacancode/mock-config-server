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

});
