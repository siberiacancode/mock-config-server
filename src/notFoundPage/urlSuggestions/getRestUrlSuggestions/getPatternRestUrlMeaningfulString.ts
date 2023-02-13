import { getUrlParts } from '../../../utils/helpers';

export const getPatternRestUrlMeaningfulString = (urlPattern: string) =>
  getUrlParts(urlPattern)
    .urlParts.filter((urlPatternPart) => !urlPatternPart.startsWith(':'))
    .join('');
