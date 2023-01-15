import type { Request, Response } from 'express';

import { callResponseInterceptors } from './callResponseInterceptors';

describe('callResponseInterceptors', () => {
  test('Should call all passed response interceptors in order: route -> request -> server', () => {
    const initialData = '';
    const request = {} as Request;
    const response = {} as Response;
    const routeInterceptor = jest.fn((data) => `${data}routeInterceptor;`);
    const requestInterceptor = jest.fn((data) => `${data}requestInterceptor;`);
    const serverInterceptor = jest.fn((data) => `${data}serverInterceptor`);

    expect(
      callResponseInterceptors({
        data: initialData,
        request,
        response
      })
    ).toBe('');
    expect(routeInterceptor.mock.calls.length).toBe(0);
    expect(requestInterceptor.mock.calls.length).toBe(0);
    expect(serverInterceptor.mock.calls.length).toBe(0);

    expect(
      callResponseInterceptors({
        data: initialData,
        request,
        response,
        interceptors: {
          routeInterceptor,
          requestInterceptor,
          serverInterceptor
        }
      })
    ).toBe('routeInterceptor;requestInterceptor;serverInterceptor');
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
