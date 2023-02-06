import { isPlainObject } from '../../../src/utils/helpers';

const validateOrigin = (origin: unknown) => {
  const isOriginArray = Array.isArray(origin);
  if (isOriginArray) {
    origin.forEach((originElement, index) => {
      const isOriginElementStringOrRegExp =
        typeof originElement === 'string' || originElement instanceof RegExp;
      if (!isOriginElementStringOrRegExp) {
        throw new Error(`origin[${index}]`);
      }
    });
    return;
  }

  const isOriginStringOrRegexp = typeof origin === 'string' || origin instanceof RegExp;
  const isOriginFunction = typeof origin === 'function';
  if (!isOriginStringOrRegexp && !isOriginFunction) {
    throw new Error('origin');
  }
};

const validateMethods = (methods: unknown) => {
  const isMethodsArray = Array.isArray(methods);
  if (isMethodsArray) {
    const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach((method, index) => {
      // ✅ important:
      // compare without 'toUpperCase' because 'Access-Control-Allow-Methods' value is case-sensitive
      if (!allowedMethods.includes(method)) {
        throw new Error(`methods[${index}]`);
      }
    });
    return;
  }

  if (typeof methods !== 'undefined') {
    throw new Error('methods');
  }
};

const validateHeaders = (headers: unknown) => {
  const isHeadersArray = Array.isArray(headers);
  if (isHeadersArray) {
    headers.forEach((header, index) => {
      if (typeof header !== 'string') {
        throw new Error(`headers[${index}]`);
      }
    });
    return;
  }

  if (typeof headers !== 'undefined') {
    throw new Error('headers');
  }
};

const validateCredentials = (credentials: unknown) => {
  if (typeof credentials !== 'boolean' && typeof credentials !== 'undefined') {
    throw new Error('credentials');
  }
};

const validateMaxAge = (maxAge: unknown) => {
  if (typeof maxAge !== 'number' && typeof maxAge !== 'undefined') {
    throw new Error('maxAge');
  }
};

export const validateCors = (cors: unknown) => {
  const isCorsObject = isPlainObject(cors);
  if (isCorsObject) {
    try {
      validateOrigin(cors.origin);
      validateMethods(cors.methods);
      validateHeaders(cors.headers);
      validateCredentials(cors.credentials);
      validateMaxAge(cors.maxAge);
    } catch (e: any) {
      throw new Error(`cors.${e.message}`);
    }
    return;
  }

  if (typeof cors !== 'undefined') {
    throw new Error('cors');
  }
};
