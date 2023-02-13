import { removeLeadingAndTrailingSlash } from './removeLeadingAndTrailingSlash';

export const addBaseUrlsToUrl = (url: string, ...baseUrls: (string | undefined)[]) => {
  const urlWithoutLeadingAndTrailingSlashes = removeLeadingAndTrailingSlash(url);

  const baseUrlsWithoutLeadingAndTrailingSlashes = baseUrls.reduce((acc, baseUrl) => {
    if (baseUrl) acc.push(removeLeadingAndTrailingSlash(baseUrl));
    return acc;
  }, [] as string[]);

  const urlWithBaseUrls = `/${baseUrlsWithoutLeadingAndTrailingSlashes.reduceRight(
    (acc, baseUrl) => {
      if (baseUrl) return `${baseUrl}/${acc}`;
      return acc;
    },
    urlWithoutLeadingAndTrailingSlashes
  )}`;

  return urlWithBaseUrls;
};
