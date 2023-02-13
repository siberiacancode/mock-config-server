import { getUrlParts } from '../../../utils/helpers';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getActualRestUrlMeaningfulString } from './getActualRestUrlMeaningfulString';
import { getPatternRestUrlMeaningfulString } from './getPatternRestUrlMeaningfulString';

interface GetRestUrlSuggestionsParams {
  url: string;
  patternUrls: string[];
}

export const getRestUrlSuggestions = ({ url, patternUrls }: GetRestUrlSuggestionsParams) => {
  const { urlParts: actualUrlParts, queryParts: actualQueryParts } = getUrlParts(url);

  const restUrlSuggestions = patternUrls.reduce((acc, patternUrl) => {
    const { urlParts: patternUrlParts } = getUrlParts(patternUrl);
    // ✅ important: ignore patterns with different amount of parts
    if (patternUrlParts.length !== actualUrlParts.length) return acc;

    const actualUrlMeaningfulString = getActualRestUrlMeaningfulString(
      actualUrlParts,
      patternUrlParts
    );
    const patternUrlMeaningfulString = getPatternRestUrlMeaningfulString(patternUrl);

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
      const suggestionWithQueryParams = `/${urlSuggestion}${
        actualQueryParts.length ? `?${actualQueryParts.join('&')}` : ''
      }`;

      acc.push(suggestionWithQueryParams);
    }

    return acc;
  }, [] as string[]);

  return restUrlSuggestions;
};
