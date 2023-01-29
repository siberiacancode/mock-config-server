import { getLevenshteinDistance } from './getLevenshteinDistance';

describe('getLevenshteinDistance', () => {
  test('Should correct return Levenshtein distance', async () => {
    expect(getLevenshteinDistance('psts', 'users')).toEqual(3);
    expect(getLevenshteinDistance('psts', 'user')).toEqual(3);
    expect(getLevenshteinDistance('psts', 'posts')).toEqual(1);
    expect(getLevenshteinDistance('users', 'users')).toEqual(0);
    expect(getLevenshteinDistance('users', 'Users')).toEqual(1);
    expect(getLevenshteinDistance('users', 'usres')).toEqual(2);
    expect(getLevenshteinDistance('1234', '1234567')).toEqual(3);
    expect(getLevenshteinDistance('post', 'zxhj')).toEqual(4);
    expect(getLevenshteinDistance('abcdef', 'fedcba')).toEqual(6);
    expect(
      getLevenshteinDistance('some very long string for testing levenshtein distance', 'some very')
    ).toEqual(45);
    expect(
      getLevenshteinDistance(
        'some very long string for testing levenshtein distance',
        'somev ery long stirng fro testng levnshtien dstance'
      )
    ).toEqual(11);
  });
});
