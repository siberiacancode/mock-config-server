import { BaseUrl } from '../../types';

import { getUrlParts } from './getUrlParts';
import { removeLeadingAndTrailingSlash } from './removeLeadingAndTrailingSlash';

export interface BaseUrls {
  baseUrl?: BaseUrl;
  restBaseUrl?: BaseUrl;
  graphqlBaseUrl?: BaseUrl;
}

interface RemoveBaseUrlsFromUrlParams {
  url: string;
  baseUrls: BaseUrls;
}

export const removeBaseUrlsFromUrl = ({ url, baseUrls }: RemoveBaseUrlsFromUrlParams) => {
  const { baseUrl, restBaseUrl, graphqlBaseUrl } = baseUrls;
  const { urlParts } = getUrlParts(url);

  if (baseUrl && urlParts[0] === removeLeadingAndTrailingSlash(baseUrl)) urlParts.shift();
  if (
    (restBaseUrl && urlParts[0] === removeLeadingAndTrailingSlash(restBaseUrl)) ||
    (graphqlBaseUrl && urlParts[0] === removeLeadingAndTrailingSlash(graphqlBaseUrl))
  )
    urlParts.shift();

  return urlParts.join('/');
};
