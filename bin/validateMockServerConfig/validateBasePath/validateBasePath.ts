import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

export const validateBasePath = (baseUrl: any, port: any) => {
  if (typeof baseUrl !== 'string' && typeof baseUrl !== 'undefined') {
    throw new Error(createValidationErrorMessage('baseUrl', 'string | undefined'));
  }
  if (typeof port !== 'number' && typeof port !== 'undefined') {
    throw new Error(createValidationErrorMessage('port', 'number | undefined'));
  }
};
