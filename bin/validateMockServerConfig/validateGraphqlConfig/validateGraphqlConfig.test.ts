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

  test('Should handle graphql config only if it contains operationName or query', () => {
    const correctGraphqlConfigs = [
      {
        configs: [
          {
            operationType: 'query',
            operationName: 'user',
            routes: []
          }
        ]
      },
      {
        configs: [
          {
            operationType: 'query',
            query: 'query GetUsers { users { name } }',
            routes: []
          }
        ]
      },
      {
        configs: [
          {
            operationType: 'query',
            operationName: 'user',
            query: 'query GetUsers { users { name } }',
            routes: []
          }
        ]
      }
    ];
    correctGraphqlConfigs.forEach((correctGraphqlConfig) => {
      expect(() => validateGraphqlConfig(correctGraphqlConfig)).not.toThrow(Error);
    });

    const incorrectGraphqlConfigs = [{ configs: [{ operationType: 'query', routes: [] }] }];
    incorrectGraphqlConfigs.forEach((incorrectGraphqlConfig) => {
      expect(() => validateGraphqlConfig(incorrectGraphqlConfig)).toThrow(
        new Error('graphql.configs[0]')
      );
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
    const correctOperationNameValues = ['user', /user/, undefined];
    correctOperationNameValues.forEach((correctOperationNameValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              query: 'query GetUsers { users { name } }',
              operationName: correctOperationNameValue,
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectOperationNameValues = [true, 3000, null, {}, [], () => {}];
    incorrectOperationNameValues.forEach((incorrectOperationNameValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              query: 'query GetUsers { users { name } }',
              operationName: incorrectOperationNameValue,
              routes: []
            }
          ]
        })
      ).toThrow('graphql.configs[0].operationName');
    });
  });

  test('Should correctly handle operation query only with correct type', () => {
    const correctQueryValues = ['query GetUsers { users { name } }', undefined];
    correctQueryValues.forEach((correctQueryValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              operationName: 'GetUsers',
              query: correctQueryValue,
              routes: []
            }
          ]
        })
      ).not.toThrow(Error);
    });

    const incorrectQueryValues = [true, 3000, null, {}, [], () => {}];
    incorrectQueryValues.forEach((incorrectQueryValue) => {
      expect(() =>
        validateGraphqlConfig({
          configs: [
            {
              operationType: 'query',
              operationName: 'GetUsers',
              query: incorrectQueryValue,
              routes: []
            }
          ]
        })
      ).toThrow('graphql.configs[0].query');
    });
  });
});
