import type { Request } from 'express';

import { callRequestInterceptor } from './callRequestInterceptor';

describe('callRequestInterceptor', () => {
  test('Should call passed request interceptor', () => {
    const request = {} as Request;
    const interceptor = jest.fn();

    callRequestInterceptor({ request, interceptor });
    expect(interceptor.mock.calls.length).toBe(1);
  });
});
