import { validateCors } from './validateCors';

describe('validateCors', () => {
  test('Should correctly handle cors only with correct type', () => {
    const correctCorsValues = [{ origin: 'string' }, undefined];
    correctCorsValues.forEach((correctCorsValue) => {
      expect(() => validateCors(correctCorsValue)).not.toThrow(Error);
    });

    const incorrectCorsValues = ['string', true, 3000, null, [], () => {}];
    incorrectCorsValues.forEach((incorrectCorsValue) => {
      expect(() => validateCors(incorrectCorsValue)).toThrow(new Error('cors'));
    });
  });

  test('Should correctly handle cors.origin only with correct type', () => {
    const correctOrigins = ['string', /string/, ['string', /string/]];
    correctOrigins.forEach((correctOrigin) => {
      expect(() => validateCors({ origin: correctOrigin })).not.toThrow(Error);
    });

    const incorrectOrigins = [true, 3000, null, undefined, {}];
    incorrectOrigins.forEach((incorrectOrigin) => {
      expect(() => validateCors({ origin: incorrectOrigin })).toThrow(new Error('cors.origin'));
    });

    const incorrectArrayOrigins = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectArrayOrigins.forEach((incorrectArrayOrigin) => {
      expect(() => validateCors({ origin: [incorrectArrayOrigin] })).toThrow('cors.origin[0]');
    });
  });

  test('Should correctly handle cors.methods only with correct type', () => {
    const correctMethodsValues = [['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], [], undefined];
    correctMethodsValues.forEach((correctMethodsValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          methods: correctMethodsValue
        })
      ).not.toThrow(Error);
    });

    const incorrectMethodsValues = ['string', true, 3000, null, {}, () => {}];
    incorrectMethodsValues.forEach((incorrectMethodsValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          methods: incorrectMethodsValue
        })
      ).toThrow(new Error('cors.methods'));
    });

    const incorrectArrayMethodsValues = ['string', true, 3000, null, undefined, {}, [], () => {}];
    incorrectArrayMethodsValues.forEach((incorrectArrayMethodsValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          methods: [incorrectArrayMethodsValue]
        })
      ).toThrow(new Error('cors.methods[0]'));
    });
  });

  test('Should correctly handle cors.headers only with correct type', () => {
    const correctHeadersValues = [['string'], [], undefined];
    correctHeadersValues.forEach((correctHeadersValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          headers: correctHeadersValue
        })
      ).not.toThrow(Error);
    });

    const incorrectHeadersValues = ['string', true, 3000, null, {}, () => {}];
    incorrectHeadersValues.forEach((incorrectHeadersValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          headers: incorrectHeadersValue
        })
      ).toThrow(new Error('cors.headers'));
    });

    const incorrectArrayHeadersValues = [true, 3000, null, undefined, {}, [], () => {}];
    incorrectArrayHeadersValues.forEach((incorrectArrayHeadersValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          headers: [incorrectArrayHeadersValue]
        })
      ).toThrow(new Error('cors.headers[0]'));
    });
  });

  test('Should correctly handle cors.credentials only with correct type', () => {
    const correctCredentialsValues = [true, false, undefined];
    correctCredentialsValues.forEach((correctCredentialsValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          credentials: correctCredentialsValue
        })
      ).not.toThrow(Error);
    });

    const incorrectCredentialsValues = ['string', 3000, null, {}, [], () => {}];
    incorrectCredentialsValues.forEach((incorrectCredentialsValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          credentials: incorrectCredentialsValue
        })
      ).toThrow(new Error('cors.credentials'));
    });
  });

  test('Should correctly handle cors.maxAge only with correct type', () => {
    const correctMaxAgeValues = [3000, undefined];
    correctMaxAgeValues.forEach((correctMaxAgeValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          maxAge: correctMaxAgeValue
        })
      ).not.toThrow(Error);
    });

    const incorrectMaxAgeValues = ['string', true, null, {}, [], () => {}];
    incorrectMaxAgeValues.forEach((incorrectMaxAgeValue) => {
      expect(() =>
        validateCors({
          origin: 'string',
          maxAge: incorrectMaxAgeValue
        })
      ).toThrow(new Error('cors.maxAge'));
    });
  });
});
