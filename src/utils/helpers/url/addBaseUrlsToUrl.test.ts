import { addBaseUrlsToUrl } from './addBaseUrlsToUrl';

describe('addBaseUrlsToUrl', () => {
  test('Should correct adding baseUrls', () => {
    expect(addBaseUrlsToUrl('/posts', 'base', '/rest')).toEqual('/base/rest/posts');
  });
  test('Should correct adding baseUrls if some bases are undefined or empty strings', () => {
    expect(addBaseUrlsToUrl('posts', undefined, 'rest', '')).toEqual('/rest/posts');
  });
});
