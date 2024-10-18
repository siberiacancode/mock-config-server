import { getLevenshteinDistance } from './getLevenshteinDistance';

describe('getLevenshteinDistance', () => {
  it('Should correct return Levenshtein distance', () => {
    expect(getLevenshteinDistance('users', 'users')).toEqual(0);
    expect(getLevenshteinDistance('psts', 'posts')).toEqual(1);
    expect(getLevenshteinDistance('postss', 'posts')).toEqual(1);
    expect(getLevenshteinDistance('users', 'Users')).toEqual(1);
    expect(getLevenshteinDistance('1234', '1234567')).toEqual(3);
    expect(getLevenshteinDistance('', '1234')).toEqual(4);
  });
});
