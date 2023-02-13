import { getUrlParts } from '../../../utils/helpers';

export const getRestUrlPatternMeaningfulString = (urlPattern: string) =>
  getUrlParts(urlPattern)
    .urlParts.filter((urlPatternPart) => !urlPatternPart.startsWith(':'))
    .join('');
