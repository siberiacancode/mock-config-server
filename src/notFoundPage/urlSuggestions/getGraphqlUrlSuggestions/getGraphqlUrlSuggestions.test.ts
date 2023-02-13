import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  const patternOperationNames: string[] = ['GetPosts', 'GetDevelopers', 'CreateDeveloper'];

  test('Should correctly return suggestions', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'Getdevoper'
        },
        patternOperationNames
      })
    ).toEqual(['/GetDevelopers', '/CreateDeveloper']);

    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/',
          operationName: 'devel'
        },
        patternOperationNames
      })
    ).toEqual([]);
  });

  test('Should correctly return suggestions with base urls if base urls are provided', () => {
    expect(
      getGraphqlUrlSuggestions({
        query: {
          url: '/base/graphql',
          operationName: 'GetPosts'
        },
        patternOperationNames,
        serverBaseUrl: '/base',
        graphqlBaseUrl: 'graphql'
      })
    ).toEqual(['/base/graphql/GetPosts']);
  });
});
