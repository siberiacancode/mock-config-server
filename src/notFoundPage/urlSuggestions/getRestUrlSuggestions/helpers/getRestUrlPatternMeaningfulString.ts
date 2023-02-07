import { getUrlParts } from '../../../../utils/helpers';

// since actual url contain param values and pattern contains param names,
// we should ignore them when calculating suggestions because they will always be different.
// (e.g. pattern has '/:id', so actual url will have '/5')
// i.e. this function returns summarized string in which the user can make a typo, and we can define this typo.
// e.g. /posts/:postId/comments/:commentId => postscomments
export const getRestUrlPatternMeaningfulString = (urlPattern: string) =>
  getUrlParts(urlPattern)
    .urlParts.filter((urlPatternPart) => !urlPatternPart.startsWith(':'))
    .join('');
