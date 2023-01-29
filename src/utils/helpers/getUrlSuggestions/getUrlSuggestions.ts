import { getLevenshteinDistance } from '../typoToleranceSearch/getLevenshteinDistance';

const removeLeadingAndTrailingSlash = (string: string) => string.replace(/^\/|\/$/g, '');

// e.g. /users/:id/ => ['users', ':id']
const getUrlParts = (url: string) => removeLeadingAndTrailingSlash(url).split('/');

// since actual url contain variable values and pattern contains variable names, we should ignore them when calculating suggestions because they will always be different. (e.g. pattern has '/:id', so actual url will have '/5')
// i.e. this function returns summarized string in which the user can make a typo, and we can find this typo.
// e.g. /posts/:postId/comments/:commentId => postscomments
const getUrlPatternMeaningfulString = (urlPattern: string) =>
  getUrlParts(urlPattern)
    .filter((urlPatternPart) => !urlPatternPart.startsWith(':'))
    .join('');

const getAverageWordsLength = (words: string[]) => words.join('').length / words.length;

const getUrlPatternTypoToleranceByAverageWordLength = (patternUrls: string[]) => {
  const patternUrlsMeaningfulStrings = patternUrls.map((patternUrl) =>
    getUrlPatternMeaningfulString(patternUrl)
  );

  return Math.floor(getAverageWordsLength(patternUrlsMeaningfulStrings));
};

const getUrlPatternTypoToleranceByHalvedShortestWord = (patternUrls: string[]) => {
  const patternUrlsMeaningfulStrings = patternUrls.map((patternUrl) =>
    getUrlPatternMeaningfulString(patternUrl)
  );

  const shortestPatternUrlMeaningfulString = patternUrlsMeaningfulStrings
    .map((word) => word.length)
    .reduce((a, b) => (a <= b ? a : b));

  return Math.floor(shortestPatternUrlMeaningfulString / 2);
};

// find similar url suggestions for url with typo using Levenshtein distance algorithm.
// typoTolerance is the maximum number of typos a user can make (an extra or missing character).
// default tolerance is half-length of the shortest pattern.
// 0 typoTolerance allows only exact match urls.
// Infinity typoTolerance disables typo checking, so all patterns with same number of parts will be returned.
export const getUrlSuggestions = (
  url: string,
  patternUrls: string[],
  typoTolerance: number | 'halvedShortestWord' | 'averageWordLength' = 'halvedShortestWord'
) => {
  let tolerance = typoTolerance;

  if (typoTolerance === 'halvedShortestWord')
    tolerance = getUrlPatternTypoToleranceByHalvedShortestWord(patternUrls);
  if (typoTolerance === 'averageWordLength')
    tolerance = getUrlPatternTypoToleranceByAverageWordLength(patternUrls);

  const [urlPath, ...queryParamsParts] = url.split('?');
  // ✅ important: query params also can have '?' symbols, so merge them back
  const queryParams = queryParamsParts.join('?');

  const actualUrlParts = getUrlParts(urlPath);

  const urlSuggestions = patternUrls.reduce((acc, patternUrl) => {
    const patternUrlParts = getUrlParts(patternUrl);
    // ignore patterns with different amount of parts
    if (patternUrlParts.length !== actualUrlParts.length) return acc;

    // remain only non-variable parts using url pattern
    const actualUrlPartsWithoutVariables = actualUrlParts.filter(
      (_actualUrlPart, index) => !patternUrlParts[index].startsWith(':')
    );
    const actualUrlMeaningfulString = actualUrlPartsWithoutVariables.join('');

    const patternUrlMeaningfulString = getUrlPatternMeaningfulString(patternUrl);

    const distance = getLevenshteinDistance(actualUrlMeaningfulString, patternUrlMeaningfulString);

    if (distance <= tolerance) {
      // replace variable names in pattern with variable values from actual url
      const urlSuggestion = patternUrlParts
        .map((_patternUrlPart, index) => {
          if (patternUrlParts[index].startsWith(':')) return actualUrlParts[index];
          return patternUrlParts[index];
        })
        .join('/');

      acc.push(`/${urlSuggestion}${queryParams.length ? `?${queryParams}` : ''}`);
    }

    return acc;
  }, [] as string[]);

  return urlSuggestions;
};
