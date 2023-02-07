import { getShortestWordLength } from '../../../../utils/helpers';

export const getGraphqlUrlPatternTypoToleranceByHalvedShortestWord = (patternUrls: string[]) =>
  Math.floor(getShortestWordLength(patternUrls) / 2);
