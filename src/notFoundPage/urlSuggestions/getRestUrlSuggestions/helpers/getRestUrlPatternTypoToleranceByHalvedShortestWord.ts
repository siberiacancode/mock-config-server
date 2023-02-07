import { getShortestWordLength } from '../../../../utils/helpers';

import { getRestUrlPatternMeaningfulString } from './getRestUrlPatternMeaningfulString';

export const getRestUrlPatternTypoToleranceByHalvedShortestWord = (patternUrls: string[]) => {
  const patternUrlsMeaningfulStrings = patternUrls.map((patternUrl) =>
    getRestUrlPatternMeaningfulString(patternUrl)
  );

  return Math.floor(getShortestWordLength(patternUrlsMeaningfulStrings) / 2);
};
