import { removeBaseUrlsFromUrl } from './removeBaseUrlsFromUrl';

describe('removeBaseUrlsFromUrl', () => {
  const baseUrls = { baseUrl: '/base', restBaseUrl: 'rest/', graphqlBaseUrl: 'graphql' };

  test('Should correct remove base urls', () => {
    expect(removeBaseUrlsFromUrl({ url: '/base/users/1', baseUrls })).toEqual('users/1');
    expect(removeBaseUrlsFromUrl({ url: '/base/rest/users/1', baseUrls })).toEqual('users/1');
    expect(removeBaseUrlsFromUrl({ url: '/base/graphql/getUsers', baseUrls })).toEqual('getUsers');
  });
});
