import { typoToleranceSearch } from './typoToleranceSearch';

const words = [
  'apple',
  'microsoft',
  'samsung',
  'nvidia',
  'videos',
  'video',
  'images',
  'music',
  'track1',
  'track2'
];

describe('typoToleranceSearch', () => {
  test('Should return one word if provided exact search word', async () => {
    expect(typoToleranceSearch('apple', words)).toEqual(['apple']);

    expect(typoToleranceSearch('appl', words)).toEqual(['apple']);
    expect(typoToleranceSearch('micrsoft', words)).toEqual(['microsoft']);

    expect(typoToleranceSearch('samsunng', words)).toEqual(['samsung']);
    expect(typoToleranceSearch('micrsoft', words)).toEqual(['microsoft']);

    expect(typoToleranceSearch('track', words)).toEqual(['track1', 'track2']);
  });
});
