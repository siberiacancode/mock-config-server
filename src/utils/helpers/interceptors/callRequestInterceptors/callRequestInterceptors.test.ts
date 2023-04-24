import type { Request } from 'express';

import { callRequestInterceptors } from './callRequestInterceptors';

describe('callRequestInterceptors', () => {
  test('Should call all passed request interceptors in order: route -> request -> server', () => {
    const request = {} as Request;
    const routeInterceptor = jest.fn();
    const requestInterceptor = jest.fn();
    const serverInterceptor = jest.fn();

    callRequestInterceptors({ request });
    expect(routeInterceptor.mock.calls.length).toBe(0);
    expect(requestInterceptor.mock.calls.length).toBe(0);
    expect(serverInterceptor.mock.calls.length).toBe(0);

    callRequestInterceptors({
      request,
      interceptors: {
        routeInterceptor,
        requestInterceptor,
        serverInterceptor
      }
    });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);
    expect(routeInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      requestInterceptor.mock.invocationCallOrder[0]
    );
    expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );
  });
});
