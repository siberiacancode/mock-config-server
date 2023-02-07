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

  test('Should return only exact match if typoTolerance is 0', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual(['/login']);
    expect(
      getRestUrlSuggestions({
        url: 'logi',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/users/5/',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/usres/5/',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comemnts/2',
        patternPaths,
        typoTolerance: 0
      })
    ).toEqual([]);
  });

  test('Should correctly return suggestions if typoTolerance is 1', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/login']);
    expect(
      getRestUrlSuggestions({
        url: 'logi',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/login']);
    expect(
      getRestUrlSuggestions({
        url: 'loginn',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/login']);

    expect(
      getRestUrlSuggestions({
        url: '/users/5/',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/usrs/5/',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/useers/5/',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/users/5']);

    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/posts/5/coments/2',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/post/5/comments/2',
        patternPaths,
        typoTolerance: 1
      })
    ).toEqual(['/posts/5/comments/2']);
  });

  test('Should return all patterns with same number of parts if typoTolerance is Infinity', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/users', '/user', '/posts', '/comments', '/login', '/logout']);
    expect(
      getRestUrlSuggestions({
        url: 'guiedbngisubgisbs',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/users', '/user', '/posts', '/comments', '/login', '/logout']);

    expect(
      getRestUrlSuggestions({
        url: '/users/5/',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/users/5', '/posts/5']);
    expect(
      getRestUrlSuggestions({
        url: '/gbwsoflbaivguwasbv/12345/',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/users/12345', '/posts/12345']);

    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/fwbgsalbwgsabp/4256/nopgnisab/2425',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/posts/4256/comments/2425']);
  });

  test('Should return patterns with same query params as provided', () => {
    expect(
      getRestUrlSuggestions({
        url: 'login?remember=true',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual([
      '/users?remember=true',
      '/user?remember=true',
      '/posts?remember=true',
      '/comments?remember=true',
      '/login?remember=true',
      '/logout?remember=true'
    ]);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?firstParam=1&secondParam=2',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual(['/users/5?firstParam=1&secondParam=2', '/posts/5?firstParam=1&secondParam=2']);
    expect(
      getRestUrlSuggestions({
        url: '/users/5?backurl=someUrl?action=success',
        patternPaths,
        typoTolerance: Infinity
      })
    ).toEqual([
      '/users/5?backurl=someUrl?action=success',
      '/posts/5?backurl=someUrl?action=success'
    ]);
  });

  test('Should correctly return suggestions if typoTolerance is halvedShortestWord', () => {
    expect(
      getRestUrlSuggestions({
        url: 'user',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/users', '/user']);
    expect(
      getRestUrlSuggestions({
        url: 'us',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/user']);
    expect(
      getRestUrlSuggestions({
        url: 'usserr',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/users', '/user']);
    expect(
      getRestUrlSuggestions({
        url: 'ussserr',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/users/5/',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/useerrs/5/',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/ers/5/',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/users/5']);
    expect(
      getRestUrlSuggestions({
        url: '/rs/5/',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual([]);

    expect(
      getRestUrlSuggestions({
        url: '/posts/5/comments/2',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/psts/5/commennts/2',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/post/5/omments/2',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual(['/posts/5/comments/2']);
    expect(
      getRestUrlSuggestions({
        url: '/psts/5/comennts/2',
        patternPaths,
        typoTolerance: 'halvedShortestWord'
      })
    ).toEqual([]);
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
