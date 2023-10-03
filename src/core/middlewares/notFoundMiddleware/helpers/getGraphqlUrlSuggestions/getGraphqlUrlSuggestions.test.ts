import type { GraphqlRequestSuggestionConfigs } from './getGraphqlUrlSuggestions';
import { getGraphqlUrlSuggestions } from './getGraphqlUrlSuggestions';

describe('getGraphqlUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const requestConfigs: GraphqlRequestSuggestionConfigs = [
      { operationType: 'query', operationName: '/GetDevelopers' },
      { operationType: 'mutation', operationName: '/CreateDeveloper' }
    ];
    expect(
      getGraphqlUrlSuggestions({
        url: new URL(`http://localhost:31299/?query=query Getdevoper { developers }}`),
        requestConfigs
      })
    ).toEqual([
      { operationType: 'query', operationName: '/GetDevelopers' },
      { operationType: 'mutation', operationName: '/CreateDeveloper' }
    ]);

    expect(
      getGraphqlUrlSuggestions({
        url: new URL(`http://localhost:31299/?query=query devel { developers }}`),
        requestConfigs
      })
    ).toEqual([]);
  });
});
