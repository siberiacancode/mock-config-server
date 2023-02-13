import { getUrlParts } from './getUrlParts';

describe('getUrlParts', () => {
  const testUrl =
    '/part1/part2/?queryParam1=value1&queryParam2=value2?nestedQueryParam1=/value3&queryParam3=123';

  test('Should correct parse url parts', () => {
    expect(getUrlParts(testUrl)).toEqual({
      urlParts: ['part1', 'part2'],
      queryParts: [
        'queryParam1=value1',
        'queryParam2=value2?nestedQueryParam1=/value3',
        'queryParam3=123'
      ]
    });
  });
});
