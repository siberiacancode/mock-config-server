import { getAllowedOrigins } from './getAllowedOrigins';

describe('getAllowedOrigins', () => {
  test('Function should return array if get string or RegExp parameter', async () => {
    expect(getAllowedOrigins(/origin/g)).resolves.toEqual([/origin/g]);
    expect(getAllowedOrigins('https://origin.com')).resolves.toEqual(['https://origin.com']);
  });

  test('Function should return array if get array parameter', () => {
    expect(getAllowedOrigins([/origin/g, 'https://origin.com'])).resolves.toEqual([
      /origin/g,
      'https://origin.com'
    ]);
  });

  test('Function should return array if get function parameter', () => {
    expect(getAllowedOrigins(() => [/origin/g, 'https://origin.com'])).resolves.toEqual([
      /origin/g,
      'https://origin.com'
    ]);
  });

  test('Function should return array if get promise parameter', () => {
    expect(
      getAllowedOrigins(() => Promise.resolve([/origin/g, 'https://origin.com']))
    ).resolves.toEqual([/origin/g, 'https://origin.com']);
  });
});
