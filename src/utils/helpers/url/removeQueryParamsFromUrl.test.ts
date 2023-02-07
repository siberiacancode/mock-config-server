import { removeQueryParamsFromUrl } from './removeQueryParamsFromUrl';

describe('removeQueryParamsFromUrl', () => {
  test('Should correct remove query params', () => {
    expect(removeQueryParamsFromUrl('/base/users/1?query1=abc&query2=def')).toEqual(
      '/base/users/1'
    );
  });
});
