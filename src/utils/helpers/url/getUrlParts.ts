import { removeLeadingAndTrailingSlash } from './removeLeadingAndTrailingSlash';

export const getUrlParts = (url: string) => {
  const urlWithoutLeadingAndTrailingSlashes = removeLeadingAndTrailingSlash(url);
  const [urlString, ...queryPartStrings] = urlWithoutLeadingAndTrailingSlashes.split('?');

  // ✅ important: query params also can have '?' symbols, so merge them back
  const queryParamsString = queryPartStrings.join('?');

  const queryParts = queryParamsString.length ? queryParamsString.split('&') : [];

  const urlParts = removeLeadingAndTrailingSlash(urlString).split('/');

  return {
    urlParts,
    queryParts
  };
};
