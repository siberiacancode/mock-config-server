import { urlJoin } from './urlJoin';

describe('urlJoin', () => {
  test('Should correctly merge paths', () => {
    expect(urlJoin('/base', '/rest')).toEqual('/base/rest');
    expect(urlJoin('/base', 'rest')).toEqual('/base/rest');
    expect(urlJoin('/base', 'rest', '/users')).toEqual('/base/rest/users');
  });
});
