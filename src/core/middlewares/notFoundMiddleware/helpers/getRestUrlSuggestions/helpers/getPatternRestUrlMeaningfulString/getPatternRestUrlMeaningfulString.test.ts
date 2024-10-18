import { getPatternRestUrlMeaningfulString } from './getPatternRestUrlMeaningfulString';

describe('getPatternRestUrlMeaningfulString', () => {
  it('Should correct return rest url pattern meaningful string', () => {
    expect(
      getPatternRestUrlMeaningfulString(['rest', 'posts', ':postId', 'comments', ':commentId'])
    ).toEqual('restpostscomments');
    expect(getPatternRestUrlMeaningfulString(['users'])).toEqual('users');
  });
});
