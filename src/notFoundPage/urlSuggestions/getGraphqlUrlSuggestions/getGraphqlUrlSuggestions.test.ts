import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const graphqlPatternUrlMeaningfulStrings: string[] = [
      '/base/graphql/GetPosts',
      '/GetDevelopers',
      '/CreateDeveloper'
    ];
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
});
