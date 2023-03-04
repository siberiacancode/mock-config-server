import { getUrlParts } from './getUrlParts';

describe('getUrlParts', () => {
  test('Should correct parse url parts', () => {
    expect(getUrlParts('/part1/part2/')).toEqual(['part1', 'part2']);
    expect(getUrlParts('//part1/part2///')).toEqual(['part1', 'part2']);
  });
});
