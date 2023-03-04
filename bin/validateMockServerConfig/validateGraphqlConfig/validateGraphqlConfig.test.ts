import { validateGraphqlConfig } from './validateGraphqlConfig';

describe('validateGraphqlConfig', () => {
  test('Should correctly handle graphql config only with correct type', () => {
    const correctGraphqlConfigs = [
      { configs: [{ operationType: 'query', operationName: 'user', routes: [] }] },
      undefined
    ];
    correctGraphqlConfigs.forEach((correctGraphqlConfig) => {
      expect(() => validateGraphqlConfig(correctGraphqlConfig)).not.toThrow(Error);
    });

    const incorrectGraphqlConfigs = ['string', true, 3000, null, [], () => {}];
    incorrectGraphqlConfigs.forEach((incorrectGraphqlConfig) => {
      expect(() => validateGraphqlConfig(incorrectGraphqlConfig)).toThrow(new Error('graphql'));
    });
  });

  test('Should correctly handle operation type only with correct type', () => {
    const correctOperationTypeValues = ['query', 'mutation'];
    correctOperationTypeValues.forEach((correctOperationTypeValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: correctOperationTypeValue,
              operationName: 'user',
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectOperationTypeValues = ['string', true, 3000, null, undefined, {}, [], () => {}];
    incorrectOperationTypeValues.forEach((incorrectOperationTypeValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: incorrectOperationTypeValue,
              operationName: 'user',
              routes: []
            }
          ]
        })
      ).toThrow('graphql.configs[0].operationType');
    });
  });

  test('Should correctly handle operation name only with correct type', () => {
    const correctOperationNameValues = ['user', /user/];
    correctOperationNameValues.forEach((correctOperationNameValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              operationName: correctOperationNameValue,
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectOperationNameValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectOperationNameValues.forEach((incorrectOperationNameValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              operationName: incorrectOperationNameValue,
              routes: []
            }
          ]
        })
      ).toThrow('graphql.configs[0].operationName');
    });
  });
});
