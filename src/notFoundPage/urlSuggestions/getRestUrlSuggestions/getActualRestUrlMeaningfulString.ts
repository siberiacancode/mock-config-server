export const getActualRestUrlMeaningfulString = (
  actualUrlParts: string[],
  patternUrlParts: string[]
) => {
  const actualUrlPartsWithoutParams = actualUrlParts.filter(
    (_actualUrlPart, index) => !patternUrlParts[index].startsWith(':')
  );
  return actualUrlPartsWithoutParams.join('');
};
