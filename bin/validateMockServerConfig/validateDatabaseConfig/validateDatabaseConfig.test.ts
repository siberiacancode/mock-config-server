import { validateDatabaseConfig } from './validateDatabaseConfig';

describe('validateDatabaseConfig', () => {
  test('Should correctly handle database config only with valid type', () => {
    const validDatabaseConfigs = [{ data: {} }, undefined];
    validDatabaseConfigs.forEach((validDatabaseConfig) => {
      expect(() => validateDatabaseConfig(validDatabaseConfig)).not.toThrow(Error);
    });

    const invalidDatabaseConfigs = ['string', true, 3000, null, [], () => {}];
    invalidDatabaseConfigs.forEach((invalidDatabaseConfig) => {
      expect(() => validateDatabaseConfig(invalidDatabaseConfig)).toThrow('database');
    });
  });

  test('Should correctly handle database config data only with valid type', () => {
    const validData = [{}, 'string.json'];
    validData.forEach((validDataElement) => {
      expect(() => validateDatabaseConfig({ data: validDataElement })).not.toThrow(Error);
    });

    const invalidData = ['string', true, 3000, null, undefined, [], () => {}];
    invalidData.forEach((invalidDataElement) => {
      expect(() => validateDatabaseConfig({ data: invalidDataElement })).toThrow('database.data');
    });
  });

  test('Should correctly handle database config routes only with valid type', () => {
    const validRoutes = [{}, 'string.json', undefined];
    validRoutes.forEach((validRoutesElement) => {
      expect(() => validateDatabaseConfig({ data: {}, routes: validRoutesElement })).not.toThrow(
        Error
      );
    });

    const invalidRoutes = ['string', true, 3000, null, [], () => {}];
    invalidRoutes.forEach((invalidRoutesElement) => {
      expect(() => validateDatabaseConfig({ data: {}, routes: invalidRoutesElement })).toThrow(
        'database.routes'
      );
    });
  });

  test('Should correctly handle database config routes keys and values only with valid type', () => {
    const validRoutesKey = '/stringWithForwardSlash';
    const validRoutesValue = '/stringWithForwardSlash';
    expect(() =>
      validateDatabaseConfig({ data: {}, routes: { [validRoutesKey]: validRoutesValue } })
    ).not.toThrow(Error);

    const invalidRoutesValues = [
      'stringWithoutForwardSlash',
      true,
      3000,
      null,
      undefined,
      {},
      [],
      () => {}
    ];
    invalidRoutesValues.forEach((invalidRoutesValue) => {
      expect(() =>
        validateDatabaseConfig({ data: {}, routes: { key: invalidRoutesValue } })
      ).toThrow('database.routes.key');
    });
  });
});
