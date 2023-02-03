import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

export const validatePort = (port: unknown) => {
  if (typeof port !== 'number' && typeof port !== 'undefined') {
    throw new Error(createValidationErrorMessage('port', 'number | undefined'));
  }
};
