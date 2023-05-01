import { getRestUrlSuggestions } from './getRestUrlSuggestions';
import type { RestRequestSuggestionConfigs } from './getRestUrlSuggestions';

describe('getRestUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const requestConfigs: RestRequestSuggestionConfigs = [
      { method: 'get', path: '/posts' },
      { method: 'get', path: '/posts/:postId' },
      { method: 'post', path: '/posts/:postId/comments/:commentId' }
    ];
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/posts/5/comments/2'),
        requestConfigs
      })
    ).toEqual([{ method: 'post', path: '/posts/5/comments/2' }]);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/psts/5/commennts/2'),
        requestConfigs
      })
    ).toEqual([{ method: 'post', path: '/posts/5/comments/2' }]);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/post/5/omments/2'),
        requestConfigs
      })
    ).toEqual([{ method: 'post', path: '/posts/5/comments/2' }]);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/ps/5/cots/2'),
        requestConfigs
      })
    ).toEqual([]);
  });

  test('Should return patterns with same query params as provided', () => {
    const requestConfigs: RestRequestSuggestionConfigs = [
      { method: 'get', path: '/users' },
      { method: 'get', path: '/users/:userId' },
      { method: 'post', path: '/user' },
      { method: 'put', path: '/comments' },
      { method: 'patch', path: '/login' },
      { method: 'get', path: '/logout' }
    ];
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/login?remember=true'),
        requestConfigs
      })
    ).toEqual([
      { method: 'patch', path: '/login?remember=true' },
      { method: 'get', path: '/logout?remember=true' }
    ]);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/users/5?firstParam=1&secondParam=2'),
        requestConfigs
      })
    ).toEqual([{ method: 'get', path: '/users/5?firstParam=1&secondParam=2' }]);
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/users/5?backurl=someUrl?action=success'),
        requestConfigs
      })
    ).toEqual([{ method: 'get', path: '/users/5?backurl=someUrl?action=success' }]);
  });
});
