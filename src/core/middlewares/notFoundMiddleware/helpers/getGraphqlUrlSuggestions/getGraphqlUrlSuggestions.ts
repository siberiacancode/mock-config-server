import type { GraphQLOperationType } from '@/utils/types';

import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

export type GraphqlRequestSuggestionConfigs = {
  operationType: GraphQLOperationType;
  operationName: string;
}[];

interface GetGraphqlUrlSuggestionsParams {
  url: URL;
  requestConfigs: GraphqlRequestSuggestionConfigs;
}

export const getGraphqlUrlSuggestions = ({
  url,
  requestConfigs
}: GetGraphqlUrlSuggestionsParams) => {
  // ✅ important: operationName is always second word in 'query' query param
  const actualOperationName = url.searchParams.get('query')?.split(' ')[1];
  const actualUrlMeaningful = `${url.pathname}/${actualOperationName}`;

  const graphqlUrlSuggestions = requestConfigs.reduce((acc, requestConfig) => {
    const { operationName } = requestConfig;
    const distance = getLevenshteinDistance(actualUrlMeaningful, operationName);

    const tolerance = Math.floor(operationName.length / 2);
    if (distance <= tolerance) acc.push(requestConfig);

    return acc;
  }, [] as GraphqlRequestSuggestionConfigs);

  return graphqlUrlSuggestions;
};
