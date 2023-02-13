export const getActualRestUrlMeaningfulString = (
  actualUrlParts: string[],
  patternUrlParts: string[]
) => {
  // remain only non-param parts using url pattern
  const actualUrlPartsWithoutParams = actualUrlParts.filter(
    (_actualUrlPart, index) => !patternUrlParts[index].startsWith(':')
  );
  return actualUrlPartsWithoutParams.join('');
};
