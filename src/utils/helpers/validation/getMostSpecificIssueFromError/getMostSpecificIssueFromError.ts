import { z } from 'zod';

export const getMostSpecificIssueFromError = (error: z.ZodError): z.ZodIssue => {
  let currentMostSpecificIssue: z.ZodIssue | undefined;
  for (const issue of error.issues) {
    if (issue.code === z.ZodIssueCode.invalid_union) {
      for (const unionError of issue.unionErrors) {
        const unionErrorMostSpecificIssue = getMostSpecificIssueFromError(unionError);
        if (
          !currentMostSpecificIssue ||
          unionErrorMostSpecificIssue.path.length >= currentMostSpecificIssue.path.length ||
          unionErrorMostSpecificIssue.code === z.ZodIssueCode.custom
        ) {
          currentMostSpecificIssue = unionErrorMostSpecificIssue;
        }
      }
    }

    if (
      issue.code === z.ZodIssueCode.unrecognized_keys &&
      (!currentMostSpecificIssue ||
        [...issue.path, ...issue.keys].length >= currentMostSpecificIssue.path.length)
    ) {
      currentMostSpecificIssue = { ...issue, path: [...issue.path, ...issue.keys] };
    }

    if (
      !currentMostSpecificIssue ||
      issue.path.length >= currentMostSpecificIssue.path.length ||
      issue.code === z.ZodIssueCode.custom
    ) {
      currentMostSpecificIssue = issue;
    }
  }

  return currentMostSpecificIssue as unknown as z.ZodIssue;
};
