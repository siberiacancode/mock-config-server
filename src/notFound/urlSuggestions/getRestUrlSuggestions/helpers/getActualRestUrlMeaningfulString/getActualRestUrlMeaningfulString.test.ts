import { getActualRestUrlMeaningfulString } from './getActualRestUrlMeaningfulString';

describe('getActualRestUrlMeaningfulString', () => {
  test('Should correctly return actual rest meaningful string', () => {
    expect(
      getActualRestUrlMeaningfulString(
        ['base', 'rest', 'posts', '2', 'comments', '5'],
        ['base', 'rest', 'posts', ':postId', 'comments', ':commentId']
      )
    ).toEqual('baserestpostscomments');
  });
});
