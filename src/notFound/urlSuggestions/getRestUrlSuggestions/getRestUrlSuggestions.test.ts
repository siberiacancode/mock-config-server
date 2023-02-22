import { getRestUrlSuggestions } from './getRestUrlSuggestions';

describe('getRestUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const patternUrls: string[] = [
      '/posts',
      '/posts/:postId',
      '/posts/:postId/comments/:commentId'
    ];
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/posts/5/comments/2'),
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/psts/5/commennts/2'),
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/post/5/omments/2'),
        patternUrls
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/ps/5/cots/2'),
        patternUrls
      })
    ).toEqual([]);
  });

  test('Should return patterns with same query params as provided', () => {
    const patternUrls: string[] = [
      '/users',
      '/users/:userId',
      '/user',
      '/comments',
      '/login',
      '/logout'
    ];
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/login?remember=true'),
        patternUrls
      })
    ).toEqual(['/login?remember=true', '/logout?remember=true']);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/users/5?firstParam=1&secondParam=2'),
        patternUrls
      })
    ).toEqual(['/users/5?firstParam=1&secondParam=2']);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/users/5?backurl=someUrl?action=success'),
        patternUrls
      })
    ).toEqual(['/users/5?backurl=someUrl?action=success']);
  });
});
