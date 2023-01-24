import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validateInterceptors } from './validateInterceptors';

describe('validateInterceptors', () => {
  test('Should correctly handle primitive values only with type undefined', () => {
    expect(() => validateInterceptors(undefined)).not.toThrow(Error);

    expect(() => validateInterceptors(true)).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));
    expect(() => validateInterceptors('interceptors')).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));
    expect(() => validateInterceptors(3000)).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));
    expect(() => validateInterceptors(null)).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));
  });

  test('Should correctly handle object values only with type { request?: Function; response?: Function }', () => {
    expect(() => validateInterceptors({})).not.toThrow(Error);
    expect(() => validateInterceptors({ request: () => {} })).not.toThrow(Error);
    expect(() => validateInterceptors({ response: () => {} })).not.toThrow(Error);
    expect(() => validateInterceptors({ request: () => {}, response: () => {} })).not.toThrow(Error);

    expect(() => validateInterceptors([])).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));
    expect(() => validateInterceptors(() => {})).toThrow(new Error(createValidationErrorMessage('interceptors', '{ request?: Function; response?: Function } | undefined')));

    expect(() => validateInterceptors({ request: true })).toThrow(new Error(createValidationErrorMessage('interceptors.request', 'Function | undefined')));
    expect(() => validateInterceptors({ request: 'request' })).toThrow(new Error(createValidationErrorMessage('interceptors.request', 'Function | undefined')));
    expect(() => validateInterceptors({ request: 3000 })).toThrow(new Error(createValidationErrorMessage('interceptors.request', 'Function | undefined')));
    expect(() => validateInterceptors({ request: null })).toThrow(new Error(createValidationErrorMessage('interceptors.request', 'Function | undefined')));

    expect(() => validateInterceptors({ response: true })).toThrow(new Error(createValidationErrorMessage('interceptors.response', 'Function | undefined')));
    expect(() => validateInterceptors({ response: 'request' })).toThrow(new Error(createValidationErrorMessage('interceptors.response', 'Function | undefined')));
    expect(() => validateInterceptors({ response: 3000 })).toThrow(new Error(createValidationErrorMessage('interceptors.response', 'Function | undefined')));
    expect(() => validateInterceptors({ response: null })).toThrow(new Error(createValidationErrorMessage('interceptors.response', 'Function | undefined')));
  });
});
