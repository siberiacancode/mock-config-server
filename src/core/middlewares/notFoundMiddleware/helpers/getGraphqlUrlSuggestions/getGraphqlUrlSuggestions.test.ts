import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';
import type { GraphqlRequestSuggestionConfigs } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const requestConfigs: GraphqlRequestSuggestionConfigs = [
      { operationType: 'query', operationName: '/GetDevelopers' },
      { operationType: 'mutation', operationName: '/CreateDeveloper' }
    ];
    expect(
      getGraphqlUrlSuggestions({
        url: new URL('http://localhost:31299/?query=query%20Getdevoper%20{%20developers%20}'),
        requestConfigs
      })
    ).toEqual([
      { operationType: 'query', operationName: '/GetDevelopers' },
      { operationType: 'mutation', operationName: '/CreateDeveloper' }
    ]);

    expect(
      getGraphqlUrlSuggestions({
        url: new URL('http://localhost:31299/base/re/pos?query=query%20devel%20{%20developers%20}'),
        requestConfigs
      })
    ).toEqual([]);
  });
});
