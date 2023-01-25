import { isPlainObject } from '../../../src/utils/helpers';
import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

const validateOrigin = (origin: any) => {
  const isOriginArray = Array.isArray(origin);
  if (isOriginArray) {
    origin.forEach((originElement, index) => {
      if (!(originElement instanceof RegExp) && typeof originElement !== 'string') {
        throw new Error(createValidationErrorMessage(`cors.origin[${index}]`, 'RegExp | string'));
      }
    });
    return;
  }

  if (!(origin instanceof RegExp) && typeof origin !== 'function' && typeof origin !== 'string') {
    throw new Error(
      createValidationErrorMessage(
        'cors.origin',
        'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
      )
    );
  }
};

const validateMethods = (methods: any) => {
  const isMethodsArray = Array.isArray(methods);
  if (isMethodsArray) {
    const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach((method, index) => {
      if (!ALLOWED_METHODS.includes(method)) {
        throw new Error(
          createValidationErrorMessage(
            `cors.methods[${index}]`,
            'RestMethod (see our doc: https://github.com/siberiacancode/mock-config-server)'
          )
        );
      }
    });
    return;
  }

  if (typeof methods !== 'undefined') {
    throw new Error(
      createValidationErrorMessage(
        'cors.methods',
        'RestMethod[] (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
      )
    );
  }
};

const validateHeaders = (headers: any) => {
  const isHeadersArray = Array.isArray(headers);
  if (isHeadersArray) {
    headers.forEach((header, index) => {
      if (typeof header !== 'string') {
        throw new Error(createValidationErrorMessage(`cors.headers[${index}]`, 'string'));
      }
    });
    return;
  }

  if (typeof headers !== 'undefined') {
    throw new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'));
  }
};

const validateCredentials = (credentials: any) => {
  if (typeof credentials !== 'boolean' && typeof credentials !== 'undefined') {
    throw new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'));
  }
};

const validateMaxAge = (maxAge: any) => {
  if (typeof maxAge !== 'number' && typeof maxAge !== 'undefined') {
    throw new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'));
  }
};

export const validateCors = (cors: any) => {
  const isCorsObject = isPlainObject(cors);
  if (isCorsObject) {
    validateOrigin(cors.origin);
    validateMethods(cors.methods);
    validateHeaders(cors.headers);
    validateCredentials(cors.credentials);
    validateMaxAge(cors.maxAge);
    return;
  }

  if (typeof cors !== 'undefined') {
    throw new Error(
      createValidationErrorMessage(
        'cors',
        'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
      )
    );
  }
};
