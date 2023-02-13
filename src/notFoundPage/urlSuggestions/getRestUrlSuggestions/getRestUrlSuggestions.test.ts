import { getRestUrlSuggestions } from './getRestUrlSuggestions';

describe('getRestUrlSuggestions', () => {
  const patternPaths: string[] = [
    'users',
    'users/:userId',
    'user',
    'posts',
    'posts/:postId',
    'posts/:postId/comments/:commentId',
    'comments',
    'login',
    'logout'
  ];

  test('Should return one suggestion if exact match found', async () => {
    expect(
      getRestUrlSuggestions({
        url: '/user',
        patternPaths
      })
    ).toEqual(['/user']);

    expect(
      getRestUrlSuggestions({
        url: '/posts/2/comments/1',
        patternPaths
      })
    ).toEqual(['/posts/2/comments/1']);
  });

  test('Should correctly return suggestions', () => {
    expect(
      getRestUrlSuggestions({
        url: 'user',
        patternPaths
      })
    ).toEqual(['/user']);
    expect(
      getRestUrlSuggestions({
        url: 'us',
        patternPaths
      })
    ).toEqual(['/user']);
    expect(
      getRestUrlSuggestions({
        url: 'usserr',
        patternPaths
      })
    ).toEqual(['/users', '/user']);
    expect(
      getRestUrlSuggestions({
        url: 'ussserr',
        patternPaths
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/users/5/',
        patternPaths
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/useerrs/5/',
        patternPaths
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/ers/5/',
        patternPaths
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/rs/5/',
        patternPaths
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternPaths
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/psts/5/commennts/2',
        patternPaths
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/post/5/omments/2',
        patternPaths
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/ps/5/cots/2',
        patternPaths
      })
    ).toEqual([]);
  });

  test('Should return patterns with same query params as provided', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login?remember=true',
        patternPaths
      })
    ).toEqual(['/login?remember=true']);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?firstParam=1&secondParam=2',
        patternPaths
      })
    ).toEqual(['/users/5?firstParam=1&secondParam=2']);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?backurl=someUrl?action=success',
        patternPaths
      })
    ).toEqual(['/users/5?backurl=someUrl?action=success']);
  });

  test('Should correctly return suggestions with base urls if base urls are provided', () => {
    expect(
      getRestUrlSuggestions({
        url: 're/posts/5/coments/2',
        patternPaths,
        restBaseUrl: '/rest'
      })
    ).toEqual(['/rest/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: 'bse/re/posts/5/comments/2',
        patternPaths,
        serverBaseUrl: '/base',
        restBaseUrl: '/rest'
      })
    ).toEqual(['/base/rest/posts/5/comments/2']);
  });
});
