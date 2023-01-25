import { createValidationErrorMessage } from '../createValidationErrorMessage/createValidationErrorMessage';

import { validateStaticPath } from './validateStaticPath';

describe('validateStaticPath', () => {
  test('Should correctly handle primitive values only with type string | undefined', () => {
    expect(() => validateStaticPath('staticPath')).not.toThrow(Error);
    expect(() => validateStaticPath(undefined)).not.toThrow(Error);

    expect(() => validateStaticPath(true)).toThrow(
      new Error(
        createValidationErrorMessage(
          'staticPath',
          'string | { prefix: string; path: string } | (string | { prefix: string; path: string })[]'
        )
      )
    );
    expect(() => validateStaticPath(3000)).toThrow(
      new Error(
        createValidationErrorMessage(
          'staticPath',
          'string | { prefix: string; path: string } | (string | { prefix: string; path: string })[]'
        )
      )
    );
    expect(() => validateStaticPath(null)).toThrow(
      new Error(
        createValidationErrorMessage(
          'staticPath',
          'string | { prefix: string; path: string } | (string | { prefix: string; path: string })[]'
        )
      )
    );
  });

  test('Should correctly handle plain object values only with type { prefix: string; path: string }', () => {
    expect(() => validateStaticPath({ prefix: 'prefix', path: 'path' })).not.toThrow(Error);

    expect(() => validateStaticPath({ prefix: true, path: undefined })).toThrow(
      new Error(createValidationErrorMessage('staticPath.prefix', 'string'))
    );
    expect(() => validateStaticPath({ prefix: 3000, path: undefined })).toThrow(
      new Error(createValidationErrorMessage('staticPath.prefix', 'string'))
    );
    expect(() => validateStaticPath({ prefix: null, path: undefined })).toThrow(
      new Error(createValidationErrorMessage('staticPath.prefix', 'string'))
    );
    expect(() => validateStaticPath({ prefix: undefined, path: undefined })).toThrow(
      new Error(createValidationErrorMessage('staticPath.prefix', 'string'))
    );

    expect(() => validateStaticPath({ prefix: 'prefix', path: true })).toThrow(
      new Error(createValidationErrorMessage('staticPath.path', 'string'))
    );
    expect(() => validateStaticPath({ prefix: 'prefix', path: 3000 })).toThrow(
      new Error(createValidationErrorMessage('staticPath.path', 'string'))
    );
    expect(() => validateStaticPath({ prefix: 'prefix', path: null })).toThrow(
      new Error(createValidationErrorMessage('staticPath.path', 'string'))
    );
    expect(() => validateStaticPath({ prefix: 'prefix', path: undefined })).toThrow(
      new Error(createValidationErrorMessage('staticPath.path', 'string'))
    );

    expect(() => validateStaticPath(() => {})).toThrow(
      new Error(
        createValidationErrorMessage(
          'staticPath',
          'string | { prefix: string; path: string } | (string | { prefix: string; path: string })[]'
        )
      )
    );
  });

  test('Should correctly handle array values only with type (string | { prefix: string; path: string })[]', () => {
    expect(() =>
      validateStaticPath(['staticPath', { prefix: 'prefix', path: 'path' }])
    ).not.toThrow(Error);

    expect(() => validateStaticPath(['staticPath', true])).toThrow(
      new Error(
        createValidationErrorMessage('staticPath[1]', 'string | { prefix: string; path: string }')
      )
    );
    expect(() => validateStaticPath(['staticPath', 3000])).toThrow(
      new Error(
        createValidationErrorMessage('staticPath[1]', 'string | { prefix: string; path: string }')
      )
    );
    expect(() => validateStaticPath(['staticPath', null])).toThrow(
      new Error(
        createValidationErrorMessage('staticPath[1]', 'string | { prefix: string; path: string }')
      )
    );
    expect(() => validateStaticPath(['staticPath', undefined])).toThrow(
      new Error(
        createValidationErrorMessage('staticPath[1]', 'string | { prefix: string; path: string }')
      )
    );

    expect(() => validateStaticPath(['staticPath', { prefix: true, path: undefined }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].prefix', 'string'))
    );
    expect(() => validateStaticPath(['staticPath', { prefix: 3000, path: undefined }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].prefix', 'string'))
    );
    expect(() => validateStaticPath(['staticPath', { prefix: null, path: undefined }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].prefix', 'string'))
    );
    expect(() =>
      validateStaticPath(['staticPath', { prefix: undefined, path: undefined }])
    ).toThrow(new Error(createValidationErrorMessage('staticPath[1].prefix', 'string')));

    expect(() => validateStaticPath(['staticPath', { prefix: 'prefix', path: true }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].path', 'string'))
    );
    expect(() => validateStaticPath(['staticPath', { prefix: 'prefix', path: 3000 }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].path', 'string'))
    );
    expect(() => validateStaticPath(['staticPath', { prefix: 'prefix', path: null }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].path', 'string'))
    );
    expect(() => validateStaticPath(['staticPath', { prefix: 'prefix', path: undefined }])).toThrow(
      new Error(createValidationErrorMessage('staticPath[1].path', 'string'))
    );
  });
});
