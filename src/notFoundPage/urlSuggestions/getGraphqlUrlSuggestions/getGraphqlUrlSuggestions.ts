import {
  addBaseUrlsToUrl,
  removeLeadingAndTrailingSlash,
  removeQueryParamsFromUrl
} from '../../../utils/helpers';
import type { BaseUrl, GraphQLOperationName, TypoTolerance } from '../../../utils/types';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getGraphqlUrlPatternTypoToleranceByHalvedShortestWord } from './helpers';

interface GetGraphqlUrlSuggestionsParams {
  query: { url: string; operationName: GraphQLOperationName };
  patternOperationNames: GraphQLOperationName[];
  serverBaseUrl?: BaseUrl;
  graphqlBaseUrl?: BaseUrl;
  typoTolerance?: TypoTolerance;
}

export const getGraphqlUrlSuggestions = ({
  query,
  patternOperationNames,
  serverBaseUrl,
  graphqlBaseUrl,
  typoTolerance = 'halvedShortestWord'
}: GetGraphqlUrlSuggestionsParams) => {
  const patternUrlMeaningfulStrings = Array.from(
    patternOperationNames.reduce((acc, operationName) => {
      if (typeof operationName === 'string')
        acc.add(addBaseUrlsToUrl(operationName, serverBaseUrl, graphqlBaseUrl));
      return acc;
    }, new Set<string>())
  );

  const actualUrlPart = removeLeadingAndTrailingSlash(removeQueryParamsFromUrl(query.url));
  const actualUrlMeaningfulString = `${actualUrlPart ? `/${actualUrlPart}` : ''}/${
    query.operationName
  }`;

  let tolerance = typoTolerance;
  if (typoTolerance === 'halvedShortestWord')
    tolerance = getGraphqlUrlPatternTypoToleranceByHalvedShortestWord(patternUrlMeaningfulStrings);

  const graphqlUrlSuggestions = patternUrlMeaningfulStrings.reduce(
    (acc, patternUrlMeaningfulString) => {
      const distance = getLevenshteinDistance(
        actualUrlMeaningfulString,
        patternUrlMeaningfulString
      );

      if (distance <= tolerance) acc.push(patternUrlMeaningfulString);

      return acc;
    },
    [] as string[]
  );

  return graphqlUrlSuggestions;
};
