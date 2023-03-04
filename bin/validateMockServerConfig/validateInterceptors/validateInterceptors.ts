import { isPlainObject } from '../../../src/utils/helpers';

export const validateInterceptors = (interceptors: unknown) => {
  const isInterceptorsObject = isPlainObject(interceptors);
  if (isInterceptorsObject) {
    const { request, response } = interceptors;
    if (typeof request !== 'function' && typeof request !== 'undefined') {
      throw new Error('interceptors.request');
    }
    if (typeof response !== 'function' && typeof response !== 'undefined') {
      throw new Error('interceptors.response');
    }
    return;
  }

  if (typeof interceptors !== 'undefined') {
    throw new Error('interceptors');
  }
};
