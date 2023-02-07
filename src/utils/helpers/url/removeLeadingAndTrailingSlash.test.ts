import { removeLeadingAndTrailingSlash } from './removeLeadingAndTrailingSlash';

describe('removeLeadingAndTrailingSlash', () => {
  test('Should correct remove leading and trailing slashes', () => {
    expect(removeLeadingAndTrailingSlash('/base/users/1/')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlash('/base/users/1')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlash('base/users/1/')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlash('/base/users/1')).toEqual('base/users/1');
  });
});
