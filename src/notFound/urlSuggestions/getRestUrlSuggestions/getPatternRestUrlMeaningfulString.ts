export const getPatternRestUrlMeaningfulString = (urlPattern: string) =>
  urlPattern.slice(1).split('/').filter((urlPatternPart) =>
    !urlPatternPart.startsWith(':')).join('');
