import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const graphqlPatternUrlMeaningfulStrings: string[] = ['/GetDevelopers', '/CreateDeveloper'];
    expect(
      getGraphqlUrlSuggestions({
        url: new URL('http://localhost:31299/?query=query%20Getdevoper%20{%20developers%20}'),
        graphqlPatternUrlMeaningfulStrings
      })
    ).toEqual(['/GetDevelopers', '/CreateDeveloper']);

    expect(
      getGraphqlUrlSuggestions({
        url: new URL('http://localhost:31299/base/re/pos?query=query%20devel%20{%20developers%20}'),
        graphqlPatternUrlMeaningfulStrings
      })
    ).toEqual([]);
  });
});
