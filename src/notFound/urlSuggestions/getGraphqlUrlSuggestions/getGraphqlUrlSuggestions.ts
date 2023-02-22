import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

interface GetGraphqlUrlSuggestionsParams {
  url: URL;
  graphqlPatternUrlMeaningfulStrings: string[];
}

export const getGraphqlUrlSuggestions = ({
  url,
  graphqlPatternUrlMeaningfulStrings
}: GetGraphqlUrlSuggestionsParams) => {
  // ✅ important: operationName is always second word in 'query' query param
  const operationName = url.searchParams.get('query')?.split(' ')[1];
  const actualUrlMeaningfulString = `${url.pathname}/${operationName}`;

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
