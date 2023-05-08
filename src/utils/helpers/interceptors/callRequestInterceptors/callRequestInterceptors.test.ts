import type { Request } from 'express';

import { callRequestInterceptors } from './callRequestInterceptors';

describe('callRequestInterceptors', () => {
  test('Should call all passed request interceptors in order: request -> api -> server', () => {
    const request = {} as Request;
    const requestInterceptor = jest.fn();
    const apiInterceptor = jest.fn();
    const serverInterceptor = jest.fn();

    callRequestInterceptors({ request });
    expect(requestInterceptor.mock.calls.length).toBe(0);
    expect(apiInterceptor.mock.calls.length).toBe(0);
    expect(serverInterceptor.mock.calls.length).toBe(0);

    callRequestInterceptors({
      request,
      interceptors: {
        requestInterceptor,
        apiInterceptor,
        serverInterceptor
      }
    });

    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(apiInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);

    expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      apiInterceptor.mock.invocationCallOrder[0]
    );
    expect(apiInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );
  });
});
