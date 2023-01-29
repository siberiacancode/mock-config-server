import { getUrlSuggestions } from './getUrlSuggestions';

const urlPatterns = [
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

describe('getUrlSuggestions', () => {
  test('Should return only exact match if typoTolerance is 0', async () => {
    expect(getUrlSuggestions('login', urlPatterns, 0)).toEqual(['/login']);
    expect(getUrlSuggestions('logi', urlPatterns, 0)).toEqual([]);

    expect(getUrlSuggestions('/users/5/', urlPatterns, 0)).toEqual(['/users/5']);
    expect(getUrlSuggestions('/usres/5/', urlPatterns, 0)).toEqual([]);

    expect(getUrlSuggestions('/posts/5/comments/2', urlPatterns, 0)).toEqual([
      '/posts/5/comments/2'
    ]);
    expect(getUrlSuggestions('/posts/5/comemnts/2', urlPatterns, 0)).toEqual([]);
  });

  test('Should correctly return suggestions if typoTolerance is 1', async () => {
    expect(getUrlSuggestions('login', urlPatterns, 1)).toEqual(['/login']);
    expect(getUrlSuggestions('logi', urlPatterns, 1)).toEqual(['/login']);
    expect(getUrlSuggestions('loginn', urlPatterns, 1)).toEqual(['/login']);

    expect(getUrlSuggestions('/users/5/', urlPatterns, 1)).toEqual(['/users/5']);
    expect(getUrlSuggestions('/usrs/5/', urlPatterns, 1)).toEqual(['/users/5']);
    expect(getUrlSuggestions('/useers/5/', urlPatterns, 1)).toEqual(['/users/5']);

    expect(getUrlSuggestions('/posts/5/comments/2', urlPatterns, 1)).toEqual([
      '/posts/5/comments/2'
    ]);
    expect(getUrlSuggestions('/posts/5/coments/2', urlPatterns, 1)).toEqual([
      '/posts/5/comments/2'
    ]);
    expect(getUrlSuggestions('/post/5/comments/2', urlPatterns, 1)).toEqual([
      '/posts/5/comments/2'
    ]);
  });

  test('Should return all patterns with same number of parts if typoTolerance is Infinity', async () => {
    expect(getUrlSuggestions('login', urlPatterns, Infinity)).toEqual([
      '/users',
      '/user',
      '/posts',
      '/comments',
      '/login',
      '/logout'
    ]);
    expect(getUrlSuggestions('guiedbngisubgisbs', urlPatterns, Infinity)).toEqual([
      '/users',
      '/user',
      '/posts',
      '/comments',
      '/login',
      '/logout'
    ]);

    expect(getUrlSuggestions('/users/5/', urlPatterns, Infinity)).toEqual(['/users/5', '/posts/5']);
    expect(getUrlSuggestions('/gbwsoflbaivguwasbv/12345/', urlPatterns, Infinity)).toEqual([
      '/users/12345',
      '/posts/12345'
    ]);

    expect(getUrlSuggestions('/posts/5/comments/2', urlPatterns, Infinity)).toEqual([
      '/posts/5/comments/2'
    ]);
    expect(getUrlSuggestions('/fwbgsalbwgsabp/4256/nopgnisab/2425', urlPatterns, Infinity)).toEqual(
      ['/posts/4256/comments/2425']
    );
  });

  test('Should return patterns with same query params as provided', async () => {
    expect(getUrlSuggestions('login?remember=true', urlPatterns, Infinity)).toEqual([
      '/users?remember=true',
      '/user?remember=true',
      '/posts?remember=true',
      '/comments?remember=true',
      '/login?remember=true',
      '/logout?remember=true'
    ]);
    expect(getUrlSuggestions('/users/5?firstParam=1&secondParam=2', urlPatterns, Infinity)).toEqual(
      ['/users/5?firstParam=1&secondParam=2', '/posts/5?firstParam=1&secondParam=2']
    );
    expect(
      getUrlSuggestions('/users/5?backurl=someUrl?action=success', urlPatterns, Infinity)
    ).toEqual([
      '/users/5?backurl=someUrl?action=success',
      '/posts/5?backurl=someUrl?action=success'
    ]);
  });

  test('Should correctly return suggestions if typoTolerance is halvedShortestWord', async () => {
    // shortest pattern is 4 character long, so typoTolerance should be 2.
    // no typos
    expect(getUrlSuggestions('user', urlPatterns, 'halvedShortestWord')).toEqual([
      '/users',
      '/user'
    ]);
    // 2 typos
    expect(getUrlSuggestions('us', urlPatterns, 'halvedShortestWord')).toEqual(['/user']);
    expect(getUrlSuggestions('usserr', urlPatterns, 'halvedShortestWord')).toEqual([
      '/users',
      '/user'
    ]);
    // 3 typos
    expect(getUrlSuggestions('ussserr', urlPatterns, 'halvedShortestWord')).toEqual([]);

    // no typos
    expect(getUrlSuggestions('/users/5/', urlPatterns, 'halvedShortestWord')).toEqual(['/users/5']);
    // 2 typos
    expect(getUrlSuggestions('/useerrs/5/', urlPatterns, 'halvedShortestWord')).toEqual([
      '/users/5'
    ]);
    expect(getUrlSuggestions('/ers/5/', urlPatterns, 'halvedShortestWord')).toEqual(['/users/5']);
    // 3 typos
    expect(getUrlSuggestions('/rs/5/', urlPatterns, 'halvedShortestWord')).toEqual([]);

    // no typos
    expect(getUrlSuggestions('/posts/5/comments/2', urlPatterns, 'halvedShortestWord')).toEqual([
      '/posts/5/comments/2'
    ]);
    // 2 typos
    expect(getUrlSuggestions('/psts/5/commennts/2', urlPatterns, 'halvedShortestWord')).toEqual([
      '/posts/5/comments/2'
    ]);
    expect(getUrlSuggestions('/post/5/omments/2', urlPatterns, 'halvedShortestWord')).toEqual([
      '/posts/5/comments/2'
    ]);
    // 3 typos
    expect(getUrlSuggestions('/psts/5/comennts/2', urlPatterns, 'halvedShortestWord')).toEqual([]);
  });

  test('Should correctly return suggestions if typoTolerance is averageWordLength', async () => {
    // average pattern length is 6.222 characters, so typoTolerance should be 6.
    // no typos
    expect(getUrlSuggestions('users', urlPatterns, 'averageWordLength')).toEqual([
      '/users',
      '/user',
      '/posts',
      '/comments',
      '/login',
      '/logout'
    ]);
    // 6 typos
    expect(getUrlSuggestions('uusseerrssh', urlPatterns, 'averageWordLength')).toEqual(['/users']);
    // 7 typos
    expect(getUrlSuggestions('uusseerrsshj', urlPatterns, 'averageWordLength')).toEqual([]);

    // no typos
    expect(getUrlSuggestions('/posts/5/', urlPatterns, 'averageWordLength')).toEqual([
      '/users/5',
      '/posts/5'
    ]);
    // 6 typos
    expect(getUrlSuggestions('/ppoopshtssj/5/', urlPatterns, 'averageWordLength')).toEqual([
      '/posts/5'
    ]);
    // 7 typos
    expect(getUrlSuggestions('/ppoopsshtssj/5/', urlPatterns, 'averageWordLength')).toEqual([]);

    // no typos
    expect(getUrlSuggestions('/posts/5/comments/2', urlPatterns, 'averageWordLength')).toEqual([
      '/posts/5/comments/2'
    ]);
    // 6 typos
    expect(getUrlSuggestions('/poos/5/coms/2', urlPatterns, 'averageWordLength')).toEqual([
      '/posts/5/comments/2'
    ]);
    // 7 typos
    expect(getUrlSuggestions('/poosyss/5/coms/2', urlPatterns, 'averageWordLength')).toEqual([]);
  });
});
