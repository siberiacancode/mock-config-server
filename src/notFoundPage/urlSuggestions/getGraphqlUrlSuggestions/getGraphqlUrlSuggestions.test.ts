import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  const graphqlPatternUrlMeaningfulStrings: string[] = [
    '/base/graphql/GetPosts',
    '/GetDevelopers',
    '/CreateDeveloper'
  ];

  test('Should correctly return suggestions', () => {
    expect(
      getGraphqlUrlSuggestions({
        url: '/',
        operationName: 'Getdevoper',
        graphqlPatternUrlMeaningfulStrings
      })
    ).toEqual(['/GetDevelopers', '/CreateDeveloper']);

    expect(
      getGraphqlUrlSuggestions({
        url: '/',
        operationName: 'devel',
        graphqlPatternUrlMeaningfulStrings
      })
    ).toEqual([]);
  });

  test('Should correctly return suggestions with base urls if base urls are provided', () => {
    expect(
      getGraphqlUrlSuggestions({
        url: '/base/graphql',
        operationName: 'GetPosts',
        graphqlPatternUrlMeaningfulStrings
      })
    ).toEqual(['/base/graphql/GetPosts']);
  });
});
