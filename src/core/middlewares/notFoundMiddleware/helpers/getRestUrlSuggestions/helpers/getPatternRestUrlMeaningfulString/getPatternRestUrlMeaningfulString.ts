export const getPatternRestUrlMeaningfulString = (patternUrlParts: string[]) =>
  patternUrlParts.filter((urlPatternPart) => !urlPatternPart.startsWith(':')).join('');
