import { isPlainObject } from '../../../src/utils/helpers';
import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

export const validateInterceptors = (interceptors: any) => {
  const isInterceptorsObject = isPlainObject(interceptors);
  if (isInterceptorsObject) {
    const { request, response } = interceptors;
    if (typeof request !== 'function' && typeof request !== 'undefined') {
      throw new Error(createValidationErrorMessage('interceptors.request', 'Function | undefined'));
    }
    if (typeof response !== 'function' && typeof response !== 'undefined') {
      throw new Error(
        createValidationErrorMessage('interceptors.response', 'Function | undefined')
      );
    }
    return;
  }

  if (typeof interceptors !== 'undefined') {
    throw new Error(
      createValidationErrorMessage(
        'interceptors',
        '{ request?: Function; response?: Function } | undefined'
      )
    );
  }
};
