import { urlJoin } from './urlJoin';

describe('urlJoin', () => {
  test('Should correctly merge paths', () => {
    expect(urlJoin('/base', '/rest')).toEqual('/base/rest');
    expect(urlJoin('/base', 'rest')).toEqual('/base/rest');
    expect(urlJoin('/base', 'rest', '/users')).toEqual('/base/rest/users');
  });

  test('Should add leading slash if it is not present in the result', () => {
    expect(urlJoin('base', 'rest')).toEqual('/base/rest');
    expect(urlJoin('base', '/rest')).toEqual('/base/rest');
  });
});
