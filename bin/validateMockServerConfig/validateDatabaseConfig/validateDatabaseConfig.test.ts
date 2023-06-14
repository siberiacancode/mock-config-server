import { validateDatabaseConfig } from './validateDatabaseConfig';

describe('validateDatabaseConfig', () => {
  test('Should correctly handle database config only with valid type', () => {
    const validDatabaseConfigs = [{ some: 'data' }, undefined];
    validDatabaseConfigs.forEach((validDataseConfig) => {
      expect(() => validateDatabaseConfig(validDataseConfig)).not.toThrow(Error);
    });

    const invalidDatabaseConfigs = ['string', true, 3000, null, [], () => {}];
    invalidDatabaseConfigs.forEach((invalidDatabaseConfig) => {
      expect(() => validateDatabaseConfig(invalidDatabaseConfig)).toThrow('database');
    });
  });
});
