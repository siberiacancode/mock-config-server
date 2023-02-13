import { getRestUrlSuggestions } from './getRestUrlSuggestions';

describe('getRestUrlSuggestions', () => {
  const patternUrls: string[] = [
    '/users',
    '/users/:userId',
    '/user',
    '/posts',
    '/posts/:postId',
    '/posts/:postId/comments/:commentId',
    '/comments',
    '/login',
    '/logout'
  ];

  test('Should return one suggestion if exact match found', () => {
    expect(
      getRestUrlSuggestions({
        url: '/user',
        patternUrls
      })
    ).toEqual(['/users', '/user']);

    expect(
      getRestUrlSuggestions({
        url: '/posts/2/comments/1',
        patternUrls
      })
    ).toEqual(['/posts/2/comments/1']);
  });

  test('Should correctly return suggestions', () => {
    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/psts/5/commennts/2',
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/post/5/omments/2',
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/ps/5/cots/2',
        patternUrls
      })
    ).toEqual([]);
  });

  test('Should return patterns with same query params as provided', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login?remember=true',
        patternUrls
      })
    ).toEqual(['/login?remember=true', '/logout?remember=true']);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?firstParam=1&secondParam=2',
        patternUrls
      })
    ).toEqual(['/users/5?firstParam=1&secondParam=2']);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?backurl=someUrl?action=success',
        patternUrls
      })
    ).toEqual(['/users/5?backurl=someUrl?action=success']);
  });
});
