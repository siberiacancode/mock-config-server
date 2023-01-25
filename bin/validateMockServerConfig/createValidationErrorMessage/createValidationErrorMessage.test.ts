import { createValidationErrorMessage } from './createValidationErrorMessage';

describe('createValidationErrorMessage', () => {
  test('Should correctly show config prop and its correct types', () => {
    const configProp = 'configuration.prop';
    const configPropCorrectTypes = 'string | number';
    expect(createValidationErrorMessage(configProp, configPropCorrectTypes)).toBe(
      'Validation Error: Invalid configuration object does not match the API schema. configuration.prop should has types: string | number'
    );
  });
});
