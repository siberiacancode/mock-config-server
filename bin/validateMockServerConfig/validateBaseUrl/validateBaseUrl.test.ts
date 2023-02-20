import { validateBaseUrl } from './validateBaseUrl';

describe('validateBaseUrl', () => {
  test('Should correctly handle baseUrl only with correct type', () => {
    const correctBaseUrls = ['/stringWithLeadingSlash', undefined];
    correctBaseUrls.forEach((correctBaseUrl) => {
      expect(() => validateBaseUrl(correctBaseUrl)).not.toThrow(Error);
    });

    const incorrectBaseUrls = ['stringWithoutLeadingSlash', true, 3000, null, {}, [], () => {}];
    incorrectBaseUrls.forEach((incorrectBaseUrl) => {
      expect(() => validateBaseUrl(incorrectBaseUrl)).toThrow(new Error('baseUrl'));
    });
  });
});
