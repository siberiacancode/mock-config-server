import { getRestUrlSuggestions } from './getRestUrlSuggestions';
import type { RestRequestSuggestionConfigs } from './getRestUrlSuggestions';

describe('getRestUrlSuggestions', () => {
  test('Should correctly return suggestions', () => {
    const requestConfigs: RestRequestSuggestionConfigs = [
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

  test('Should return requests with same query params as provided', () => {
    const requestConfigs: RestRequestSuggestionConfigs = [
      { method: 'get', path: '/users' },
      { method: 'get', path: '/users/:userId' },
      { method: 'post', path: '/user' },
      { method: 'post', path: '/login' },
      { method: 'delete', path: '/logout' }
    ];
    expect(
      getRestUrlSuggestions({
        url: new URL('http://localhost:31299/login?remember=true?action=success'),
        requestConfigs
      })
    ).toEqual([
      { method: 'post', path: '/login?remember=true?action=success' },
      { method: 'delete', path: '/logout?remember=true?action=success' }
    ]);
  });
});
