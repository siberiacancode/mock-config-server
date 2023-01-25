import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validateBasePath } from './validateBasePath';

describe('validateBasePath', () => {
  test('Should correctly handle values only with type string | undefined for baseUrl', () => {
    expect(() => validateBasePath(undefined, undefined)).not.toThrow(Error);
    expect(() => validateBasePath('baseUrl', undefined)).not.toThrow(Error);

    expect(() => validateBasePath(true, undefined)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBasePath(3000, undefined)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBasePath(null, undefined)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBasePath({}, undefined)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
    expect(() => validateBasePath(() => {}, undefined)).toThrow(
      new Error(createValidationErrorMessage('baseUrl', 'string | undefined'))
    );
  });

  test('Should correctly handle values only with type number | undefined for port', () => {
    expect(() => validateBasePath(undefined, undefined)).not.toThrow(Error);
    expect(() => validateBasePath(undefined, 3000)).not.toThrow(Error);

    expect(() => validateBasePath(undefined, true)).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validateBasePath(undefined, 'baseUrl')).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validateBasePath(undefined, null)).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validateBasePath(undefined, {})).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validateBasePath(undefined, () => {})).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
  });
});
