import { removeLeadingAndTrailingSlash, removeQueryParamsFromUrl } from '../../../utils/helpers';

export const getActualGraphqlUrlMeaningfulString = (url: string, operationName: string) => {
  const actualUrlPart = removeLeadingAndTrailingSlash(removeQueryParamsFromUrl(url));
  return `${actualUrlPart ? `/${actualUrlPart}` : ''}/${operationName}`;
};
