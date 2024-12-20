import type { Request } from 'express';

import { callRequestLogger } from './callRequestLogger';

describe('callRequestLogger', () => {
  const request = {
    url: '/posts/2',
    method: 'POST',
    body: {},
    id: 1,
    timestamp: 1735623296789,
    graphQL: null,
    cookies: { token: 'token' },
    get: (headerName: string) => headerName,
    protocol: 'http',
    originalUrl: '/api/rest/posts/2'
  } as Request;

  test('Should log default tokens if logger or tokenOptions was not provided', () => {
    const consoleDir = vi.spyOn(console, 'dir');

    callRequestLogger({ request });

    expect(consoleDir.mock.lastCall).toStrictEqual([
      {
        type: 'request',
        id: 1,
        timestamp: '31.12.2024, 12:34:56,789',
        method: 'POST',
        url: 'http://host/api/rest/posts/2'
      },
      { depth: null }
    ]);

    callRequestLogger({ request, logger: {} });

    expect(consoleDir.mock.lastCall).toStrictEqual([
      {
        type: 'request',
        id: 1,
        timestamp: '31.12.2024, 12:34:56,789',
        method: 'POST',
        url: 'http://host/api/rest/posts/2'
      },
      { depth: null }
    ]);
  });

  test('Should not log if enabled is false', () => {
    const consoleDir = vi.spyOn(console, 'dir');

    callRequestLogger({ request, logger: { enabled: false } });

    expect(consoleDir.mock.lastCall).toStrictEqual(undefined);
  });

  test('Should call rewrite function with unformatted tokens instead of default console.dir if provided', () => {
    const consoleDir = vi.spyOn(console, 'dir');
    const rewrite = vi.fn();

    callRequestLogger({ request, logger: { rewrite } });

    expect(consoleDir.mock.calls.length).toBe(0);
    expect(rewrite.mock.calls.length).toBe(1);
    expect(rewrite.mock.lastCall).toStrictEqual([
      {
        type: 'request',
        id: 1,
        timestamp: 1735623296789,
        method: 'post',
        url: 'http://host/api/rest/posts/2'
      }
    ]);
  });

  test('Should return logged token values or null if enabled if false', () => {
    const rewrite = vi.fn();

    expect(callRequestLogger({ request })).toStrictEqual({
      type: 'request',
      id: 1,
      timestamp: 1735623296789,
      method: 'post',
      url: 'http://host/api/rest/posts/2'
    });
    expect(callRequestLogger({ request, logger: { enabled: false } })).toBe(null);

    expect(callRequestLogger({ request, logger: { rewrite } })).toStrictEqual({
      type: 'request',
      id: 1,
      timestamp: 1735623296789,
      method: 'post',
      url: 'http://host/api/rest/posts/2'
    });
    expect(callRequestLogger({ request, logger: { enabled: false, rewrite } })).toBe(null);
  });
});
