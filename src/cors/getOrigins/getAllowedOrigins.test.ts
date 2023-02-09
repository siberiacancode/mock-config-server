import { getAllowedOrigins } from './getAllowedOrigins';

describe('getAllowedOrigins', () => {
  test('Function should return array if get string or RegExp parameter', async () => {
    expect(await getAllowedOrigins(/origin/g)).toEqual([/origin/g]);
    expect(await getAllowedOrigins('https://origin.com')).toEqual(['https://origin.com']);
  });

  test('Function should return array if get array parameter', async () => {
    expect(await getAllowedOrigins([/origin/g, 'https://origin.com'])).toEqual([
      /origin/g,
      'https://origin.com'
    ]);
  });

  test('Function should return array if get function parameter', async () => {
    expect(await getAllowedOrigins(() => 'https://origin.com')).toEqual(['https://origin.com']);
    expect(await getAllowedOrigins(() => [/origin/g, 'https://origin.com'])).toEqual([
      /origin/g,
      'https://origin.com'
    ]);
  });

  test('Function should return array if get promise parameter', async () => {
    expect(await getAllowedOrigins(() => Promise.resolve('https://origin.com'))).toEqual([
      'https://origin.com'
    ]);
    expect(
      await getAllowedOrigins(() => Promise.resolve([/origin/g, 'https://origin.com']))
    ).toEqual([/origin/g, 'https://origin.com']);
  });
});
