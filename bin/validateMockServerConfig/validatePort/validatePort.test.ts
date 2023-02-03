import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validatePort } from './validatePort';

describe('validatePort', () => {
  test('Should correctly handle value only with type number | undefined', () => {
    expect(() => validatePort(undefined)).not.toThrow(Error);
    expect(() => validatePort(3000)).not.toThrow(Error);

    expect(() => validatePort(true)).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validatePort('port')).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validatePort(null)).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validatePort({})).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validatePort([])).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
    expect(() => validatePort(() => {})).toThrow(
      new Error(createValidationErrorMessage('port', 'number | undefined'))
    );
  });
});
