import { getUrlParts } from '@/utils/helpers';
import type { RestMethod, RestPathString } from '@/utils/types';

import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import { getActualRestUrlMeaningfulString, getPatternRestUrlMeaningfulString } from './helpers';

export type RestRequestSuggestionConfigs = { method: RestMethod; path: RestPathString }[];

interface GetRestUrlSuggestionsParams {
  url: URL;
  requestConfigs: RestRequestSuggestionConfigs;
}

export const getRestUrlSuggestions = ({ url, requestConfigs }: GetRestUrlSuggestionsParams) => {
  const actualUrlParts = getUrlParts(url.pathname);

  const restUrlSuggestions = requestConfigs.reduce((acc, requestConfig) => {
    const patternUrlParts = getUrlParts(requestConfig.path);
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
      const suggestionWithQueryParams = `/${urlSuggestion}${url.search}` as RestPathString;

      acc.push({ ...requestConfig, path: suggestionWithQueryParams });
    }

    return acc;
  }, [] as RestRequestSuggestionConfigs);

  return restUrlSuggestions;
};
