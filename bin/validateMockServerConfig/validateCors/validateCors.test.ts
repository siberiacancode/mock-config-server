import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validateCors } from './validateCors';

describe('validateCors', () => {
  test('Should correctly handle cors only with type Cors', () => {
    expect(() => validateCors({ origin: 'origin' })).not.toThrow(Error);
    expect(() => validateCors(undefined)).not.toThrow(Error);

    expect(() => validateCors(true)).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors('cors')).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors(3000)).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors(null)).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors([])).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors(() => {})).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors',
          'Cors (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
  });

  test('Should correctly handle cors.origin only with type CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin)', () => {
    // TODO should throw error
    expect(() => validateCors({ origin: () => {} })).not.toThrow(Error);

    expect(() => validateCors({ origin: 'origin' })).not.toThrow(Error);
    expect(() => validateCors({ origin: /origin/gi })).not.toThrow(Error);
    expect(() => validateCors({ origin: ['origin', /origin/gi] })).not.toThrow(Error);

    expect(() => validateCors({ origin: () => 'origin' })).not.toThrow(Error);
    expect(() => validateCors({ origin: () => /origin/gi })).not.toThrow(Error);
    expect(() => validateCors({ origin: () => ['origin', /origin/gi] })).not.toThrow(Error);
    expect(() => validateCors({ origin: () => Promise.resolve('origin') })).not.toThrow(Error);
    expect(() => validateCors({ origin: () => Promise.resolve(/origin/gi) })).not.toThrow(Error);
    expect(() =>
      validateCors({ origin: () => Promise.resolve(['origin', /origin/gi]) })
    ).not.toThrow(Error);

    expect(() => validateCors({ origin: true })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.origin',
          'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
    expect(() => validateCors({ origin: 3000 })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.origin',
          'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
    expect(() => validateCors({ origin: null })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.origin',
          'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
    expect(() => validateCors({ origin: undefined })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.origin',
          'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
    expect(() => validateCors({ origin: {} })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.origin',
          'CorsOrigin | (() => Promise<CorsOrigin> | CorsOrigin) (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
  });

  test('Should correctly handle cors.methods only with type RestMethod[]', () => {
    expect(() =>
      validateCors({ origin: 'origin', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] })
    ).not.toThrow(Error);
    expect(() => validateCors({ origin: 'origin', methods: undefined })).not.toThrow(Error);

    expect(() => validateCors({ origin: 'origin', methods: true })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.methods',
          'RestMethod[] (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors({ origin: 'origin', methods: 'methods' })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.methods',
          'RestMethod[] (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors({ origin: 'origin', methods: 3000 })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.methods',
          'RestMethod[] (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors({ origin: 'origin', methods: null })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.methods',
          'RestMethod[] (see our doc: https://github.com/siberiacancode/mock-config-server) | undefined'
        )
      )
    );
    expect(() => validateCors({ origin: 'origin', methods: ['string'] })).toThrow(
      new Error(
        createValidationErrorMessage(
          'cors.methods[0]',
          'RestMethod (see our doc: https://github.com/siberiacancode/mock-config-server)'
        )
      )
    );
  });

  test('Should correctly handle cors.headers only with type string[] | undefined', () => {
    expect(() => validateCors({ origin: 'origin', headers: ['string'] })).not.toThrow(Error);
    expect(() => validateCors({ origin: 'origin', headers: undefined })).not.toThrow(Error);

    expect(() => validateCors({ origin: 'origin', headers: true })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: 'headers' })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: 3000 })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: null })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: {} })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: () => {} })).toThrow(
      new Error(createValidationErrorMessage('cors.headers', 'string[] | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', headers: [3000] })).toThrow(
      new Error(createValidationErrorMessage('cors.headers[0]', 'string'))
    );
  });

  test('Should correctly handle cors.credentials only with type boolean | undefined', () => {
    expect(() => validateCors({ origin: 'origin', credentials: true })).not.toThrow(Error);
    expect(() => validateCors({ origin: 'origin', credentials: undefined })).not.toThrow(Error);

    expect(() => validateCors({ origin: 'origin', credentials: 'credentials' })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', credentials: 3000 })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', credentials: null })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', credentials: {} })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', credentials: [] })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', credentials: () => {} })).toThrow(
      new Error(createValidationErrorMessage('cors.credentials', 'boolean | undefined'))
    );
  });

  test('Should correctly handle cors.maxAge only with type number | undefined', () => {
    expect(() => validateCors({ origin: 'origin', maxAge: 3000 })).not.toThrow(Error);
    expect(() => validateCors({ origin: 'origin', maxAge: undefined })).not.toThrow(Error);

    expect(() => validateCors({ origin: 'origin', maxAge: true })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', maxAge: 'maxAge' })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', maxAge: null })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', maxAge: {} })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', maxAge: [] })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
    expect(() => validateCors({ origin: 'origin', maxAge: () => {} })).toThrow(
      new Error(createValidationErrorMessage('cors.maxAge', 'number | undefined'))
    );
  });
});
