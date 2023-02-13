import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getActualGraphqlUrlMeaningfulString } from './getActualGraphqlUrlMeaningfulString';

interface GetGraphqlUrlSuggestionsParams {
  url: string;
  operationName: string;
  graphqlPatternUrlMeaningfulStrings: string[];
}

export const getGraphqlUrlSuggestions = ({
  url,
  operationName,
  graphqlPatternUrlMeaningfulStrings
}: GetGraphqlUrlSuggestionsParams) => {
  const actualUrlMeaningfulString = getActualGraphqlUrlMeaningfulString(url, operationName);

  const graphqlUrlSuggestions = graphqlPatternUrlMeaningfulStrings.reduce(
    (acc, patternUrlMeaningfulString) => {
      const distance = getLevenshteinDistance(
        actualUrlMeaningfulString,
        patternUrlMeaningfulString
      );

      const tolerance = Math.floor(patternUrlMeaningfulString.length / 2);
      if (distance <= tolerance) acc.push(patternUrlMeaningfulString);

      return acc;
    },
    [] as string[]
  );

  return graphqlUrlSuggestions;
};
