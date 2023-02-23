export const getActualRestUrlMeaningfulString = (
  actualUrlParts: string[],
  patternUrlParts: string[]
) =>
  actualUrlParts
    .filter((_actualUrlPart, index) => !patternUrlParts[index].startsWith(':'))
    .join('');
