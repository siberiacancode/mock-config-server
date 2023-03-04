import { getUrlParts } from '../../../utils/helpers';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getActualRestUrlMeaningfulString, getPatternRestUrlMeaningfulString } from './helpers';

interface GetRestUrlSuggestionsParams {
  url: URL;
  patternUrls: string[];
}

export const getRestUrlSuggestions = ({ url, patternUrls }: GetRestUrlSuggestionsParams) => {
  const actualUrlParts = getUrlParts(url.pathname);

  const restUrlSuggestions = patternUrls.reduce((acc, patternUrl) => {
    const patternUrlParts = getUrlParts(patternUrl);
    // ✅ important: ignore patterns with different amount of parts
    if (patternUrlParts.length !== actualUrlParts.length) return acc;

    const actualUrlMeaningfulString = getActualRestUrlMeaningfulString(
      actualUrlParts,
      patternUrlParts
    );
    const patternUrlMeaningfulString = getPatternRestUrlMeaningfulString(patternUrlParts);

    const tolerance = Math.floor(patternUrlMeaningfulString.length / 2);
    const distance = getLevenshteinDistance(actualUrlMeaningfulString, patternUrlMeaningfulString);

    if (distance <= tolerance) {
      // replace param names in pattern with param values from actual url
      const urlSuggestion = patternUrlParts
        .map((_patternUrlPart, index) => {
          if (patternUrlParts[index].startsWith(':')) return actualUrlParts[index];
          return patternUrlParts[index];
        })
        .join('/');
      const suggestionWithQueryParams = `/${urlSuggestion}${url.search}`;

      acc.push(suggestionWithQueryParams);
    }

    return acc;
  }, [] as string[]);

  return restUrlSuggestions;
};
