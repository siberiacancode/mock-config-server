import { removeLeadingAndTrailingSlash, removeQueryParamsFromUrl } from '../../../utils/helpers';
import type { GraphQLOperationName } from '../../../utils/types';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

interface GetGraphqlUrlSuggestionsParams {
  url: string;
  operationName: GraphQLOperationName
  graphqlPatternUrlMeaningfulStrings: string[];
}

export const getGraphqlUrlSuggestions = ({
  url,
  operationName,
  graphqlPatternUrlMeaningfulStrings
}: GetGraphqlUrlSuggestionsParams) => {
  const actualUrlPart = removeLeadingAndTrailingSlash(removeQueryParamsFromUrl(url));
  const actualUrlMeaningfulString = `${actualUrlPart ? `/${actualUrlPart}` : ''}/${operationName}`;

  let exactMatchSuggestion = '';
  const graphqlUrlSuggestions = graphqlPatternUrlMeaningfulStrings.reduce(
    (acc, patternUrlMeaningfulString) => {
      const distance = getLevenshteinDistance(
        actualUrlMeaningfulString,
        patternUrlMeaningfulString
      );

      if (!distance) exactMatchSuggestion = actualUrlMeaningfulString;
      const tolerance = Math.floor(patternUrlMeaningfulString.length / 2);
      if (distance <= tolerance) acc.push(patternUrlMeaningfulString);

      return acc;
    },
    [] as string[]
  );

  if (exactMatchSuggestion) return [exactMatchSuggestion];
  return graphqlUrlSuggestions;
};
