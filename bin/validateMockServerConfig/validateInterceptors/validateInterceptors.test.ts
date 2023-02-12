import { validateInterceptors } from './validateInterceptors';

describe('validateInterceptors', () => {
  test('Should correctly handle interceptors only with correct type', () => {
    const correctInterceptorsValues = [{ request: () => {}, response: () => {} }, undefined];
    correctInterceptorsValues.forEach((correctInterceptorsValue) => {
      expect(() => validateInterceptors(correctInterceptorsValue)).not.toThrow(Error);
    });

    const incorrectInterceptorsValues = ['string', true, 3000, null, [], () => {}];
    incorrectInterceptorsValues.forEach((incorrectInterceptorsValue) => {
      expect(() => validateInterceptors(incorrectInterceptorsValue)).toThrow(
        new Error('interceptors')
      );
    });
  });

  test('Should correctly handle interceptors request and response only with correctType', () => {
    const correctRequestOrResponseInterceptorsValues = [() => {}, undefined];
    correctRequestOrResponseInterceptorsValues.forEach(
      (correctRequestOrResponseInterceptorsValue) => {
        expect(() =>
          validateInterceptors({
            request: correctRequestOrResponseInterceptorsValue
          })
        ).not.toThrow(Error);
        expect(() =>
          validateInterceptors({
            response: correctRequestOrResponseInterceptorsValue
          })
        ).not.toThrow(Error);
      }
    );

    const incorrectRequestOrResponseInterceptorsValues = ['string', true, 3000, null, {}, []];
    incorrectRequestOrResponseInterceptorsValues.forEach(
      (incorrectRequestOrResponseInterceptorsValue) => {
        expect(() =>
          validateInterceptors({
            request: incorrectRequestOrResponseInterceptorsValue
          })
        ).toThrow(new Error('interceptors.request'));
        expect(() =>
          validateInterceptors({
            response: incorrectRequestOrResponseInterceptorsValue
          })
        ).toThrow(new Error('interceptors.response'));
      }
    );
  });
});
