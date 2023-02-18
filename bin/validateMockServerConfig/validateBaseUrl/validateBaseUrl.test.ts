import { validateBaseUrl } from './validateBaseUrl';

describe('validateBaseUrl', () => {
  test('Should correctly handle baseUrl only with correct type', () => {
    const correctBaseUrls = ['/stringWithForwardSlash', undefined];
    correctBaseUrls.forEach((correctBaseUrl) => {
      expect(() => validateBaseUrl(correctBaseUrl)).not.toThrow(Error);
    });

    const incorrectBaseUrls = ['stringWithoutForwardSlash', true, 3000, null, {}, [], () => {}];
    incorrectBaseUrls.forEach((incorrectBaseUrl) => {
      expect(() => validateBaseUrl(incorrectBaseUrl)).toThrow(new Error('baseUrl'));
    });
  });
});
