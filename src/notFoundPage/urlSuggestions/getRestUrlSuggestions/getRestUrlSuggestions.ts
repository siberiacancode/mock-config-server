import { getUrlParts } from '../../../utils/helpers';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getRestUrlPatternMeaningfulString } from './getRestUrlPatternMeaningfulString';

interface GetRestUrlSuggestionsParams {
  url: string;
  patternUrls: string[];
}

export const getRestUrlSuggestions = ({
  url,
  patternUrls
}: GetRestUrlSuggestionsParams) => {
  const { urlParts: actualUrlParts, queryParts: actualQueryParts } = getUrlParts(url);

  let exactMatchSuggestion = '';
  const restUrlSuggestions = patternUrls.reduce((acc, patternUrl) => {
    const { urlParts: patternUrlParts } = getUrlParts(patternUrl);
    // ignore patterns with different amount of parts
    if (patternUrlParts.length !== actualUrlParts.length) return acc;

    // remain only non-param parts using url pattern
    const actualUrlPartsWithoutParams = actualUrlParts.filter(
      (_actualUrlPart, index) => !patternUrlParts[index].startsWith(':')
    );
    const actualUrlMeaningfulString = actualUrlPartsWithoutParams.join('');
    const patternUrlMeaningfulString = getRestUrlPatternMeaningfulString(patternUrl);

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

      if (!distance) exactMatchSuggestion = suggestionWithQueryParams;
      acc.push(suggestionWithQueryParams);
    }

    return acc;
  }, [] as string[]);

  if (exactMatchSuggestion) return [exactMatchSuggestion];
  return restUrlSuggestions;
};
