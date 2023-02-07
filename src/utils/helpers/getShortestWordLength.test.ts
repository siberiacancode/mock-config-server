import { getShortestWordLength } from './getShortestWordLength';

describe('getShortestWordLength', () => {
  test('Should correct return shortest word length', () => {
    expect(getShortestWordLength(['12345678', '1234567', 'abcde', 'abcdefg'])).toEqual(5);
    expect(getShortestWordLength([''])).toEqual(0);
    expect(getShortestWordLength([])).toEqual(0);
  });
});
