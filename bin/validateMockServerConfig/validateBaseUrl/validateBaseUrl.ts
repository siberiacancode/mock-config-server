import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

export const validateBaseUrl = (baseUrl: unknown) => {
  if (typeof baseUrl !== 'string' && typeof baseUrl !== 'undefined') {
    throw new Error(createValidationErrorMessage('baseUrl', 'string | undefined'));
  }
};
