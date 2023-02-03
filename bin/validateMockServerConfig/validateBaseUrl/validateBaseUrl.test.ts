import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validateBaseUrl } from './validateBaseUrl';

describe('validateBaseUrl', () => {
  test('Should correctly handle value only with type string | undefined', () => {
    expect(() => validateBaseUrl(undefined)).not.toThrow(Error);
    expect(() => validateBaseUrl('baseUrl')).not.toThrow(Error);

    expect(() => validateBaseUrl(true)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBaseUrl(3000)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBaseUrl(null)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBaseUrl({})).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBaseUrl([])).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBaseUrl(() => {})).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
  });
});
