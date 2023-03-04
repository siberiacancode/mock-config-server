import { removeLeadingAndTrailingSlashes } from './removeLeadingAndTrailingSlashes';

describe('removeLeadingAndTrailingSlashes', () => {
  test('Should correct remove leading and trailing slashes', () => {
    expect(removeLeadingAndTrailingSlashes('///base/users/1')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlashes('//base/users/1///')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlashes('base/users/1/')).toEqual('base/users/1');
    expect(removeLeadingAndTrailingSlashes('/base/users/1')).toEqual('base/users/1');
  });
});
