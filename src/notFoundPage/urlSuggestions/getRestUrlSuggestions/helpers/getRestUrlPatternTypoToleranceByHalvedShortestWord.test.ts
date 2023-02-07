import { getRestUrlPatternTypoToleranceByHalvedShortestWord } from './getRestUrlPatternTypoToleranceByHalvedShortestWord';

describe('getRestUrlPatternTypoToleranceByHalvedShortestWord', () => {
  test('Should correct return typo tolerance', () => {
    expect(
      getRestUrlPatternTypoToleranceByHalvedShortestWord([
        '/rest/posts/:postId/comments/:commentId',
        'rest/users'
      ])
    ).toEqual(4);
  });
});
