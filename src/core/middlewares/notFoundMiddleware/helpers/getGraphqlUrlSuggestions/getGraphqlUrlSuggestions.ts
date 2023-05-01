import type { GraphQLRequestConfig } from '@/utils/types';

import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

export type GraphqlRequestSuggestionConfigs = Array<
  Pick<GraphQLRequestConfig, 'operationType'> & { operationName: string }
>;

interface GetGraphqlUrlSuggestionsParams {
  url: URL;
  requestConfigs: GraphqlRequestSuggestionConfigs;
}

export const getGraphqlUrlSuggestions = ({
  url,
  requestConfigs
}: GetGraphqlUrlSuggestionsParams) => {
  // ✅ important: operationName is always second word in 'query' query param
  const operationName = url.searchParams.get('query')?.split(' ')[1];
  const actualUrlMeaningful = `${url.pathname}/${operationName}`;

  const graphqlUrlSuggestions = requestConfigs.reduce((acc, requestConfig) => {
    const distance = getLevenshteinDistance(actualUrlMeaningful, requestConfig.operationName);

    const tolerance = Math.floor(requestConfig.operationName.length / 2);
    if (distance <= tolerance)
      acc.push({
        ...requestConfig,
        operationName: requestConfig.operationName
      });

    return acc;
  }, [] as GraphqlRequestSuggestionConfigs);

  return graphqlUrlSuggestions;
};
