import { addBaseUrlsToUrl, getUrlParts } from '../../../utils/helpers';
import type { BaseUrl, TypoTolerance } from '../../../utils/types';
import { RequestPath } from '../../../utils/types';
import { getLevenshteinDistance } from '../getLevenshteinDistance/getLevenshteinDistance';

import {
  getRestUrlPatternMeaningfulString,
  getRestUrlPatternTypoToleranceByHalvedShortestWord
} from './helpers';

interface GetRestUrlSuggestionsParams {
  url: string;
  patternPaths: RequestPath[];
  serverBaseUrl?: BaseUrl;
  restBaseUrl?: BaseUrl;
  typoTolerance?: TypoTolerance;
}

export const getRestUrlSuggestions = ({
  url,
  patternPaths,
  serverBaseUrl,
  restBaseUrl,
  typoTolerance = 'halvedShortestWord'
}: GetRestUrlSuggestionsParams) => {
  const patternUrls = Array.from(
    patternPaths.reduce((acc, patternPath) => {
      if (typeof patternPath === 'string')
        acc.add(addBaseUrlsToUrl(patternPath, serverBaseUrl, restBaseUrl));
      return acc;
    }, new Set<string>())
  );

  let tolerance = typoTolerance;
  if (typoTolerance === 'halvedShortestWord')
    tolerance = getRestUrlPatternTypoToleranceByHalvedShortestWord(patternUrls);

  const { urlParts: actualUrlParts, queryParts: actualQueryParts } = getUrlParts(url);

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

    const distance = getLevenshteinDistance(actualUrlMeaningfulString, patternUrlMeaningfulString);

    if (distance <= tolerance) {
      // replace param names in pattern with param values from actual url
      const urlSuggestion = patternUrlParts
        .map((_patternUrlPart, index) => {
          if (patternUrlParts[index].startsWith(':')) return actualUrlParts[index];
          return patternUrlParts[index];
        })
        .join('/');

      acc.push(
        `/${urlSuggestion}${actualQueryParts.length ? `?${actualQueryParts.join('&')}` : ''}`
      );
    }

    return acc;
  }, [] as string[]);

  return Array.from(restUrlSuggestions);
};
