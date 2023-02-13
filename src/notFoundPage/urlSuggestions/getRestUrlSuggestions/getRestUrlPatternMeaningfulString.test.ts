import { getRestUrlPatternMeaningfulString } from './getRestUrlPatternMeaningfulString';

describe('getRestUrlPatternMeaningfulString', () => {
  test('Should correct return rest url pattern meaningful string', () => {
    expect(getRestUrlPatternMeaningfulString('/rest/posts/:postId/comments/:commentId')).toEqual(
      'restpostscomments'
    );
    expect(getRestUrlPatternMeaningfulString('/users')).toEqual('users');
  });
});
