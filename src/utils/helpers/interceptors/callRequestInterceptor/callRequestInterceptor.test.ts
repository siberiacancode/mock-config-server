import type { Request } from 'express';

import type { RequestInterceptor } from '@/utils/types';

import { callRequestInterceptor } from './callRequestInterceptor';

const createRequest = (value: object) =>
  ({
    context: { orm: {} },
    ...value
  }) as Request;

describe('callRequestInterceptor: order of calls', () => {
  test('Should call passed request interceptor', () => {
    const request = createRequest({});
    const interceptor = vi.fn();

    callRequestInterceptor({ request, interceptor });
    expect(interceptor).toBeCalledTimes(1);
  });
});

describe('callRequestInterceptors: params functions', () => {
  test('Should correctly get header from request.headers object when use getHeader param', () => {
    const request = createRequest({ headers: { name: 'value' } });
    const getHeaderRequestInterceptor: RequestInterceptor = ({ getHeader }) => {
      expect(getHeader('name')).toBe('value');
    };

    callRequestInterceptor({
      request: request as unknown as Request,
      interceptor: getHeaderRequestInterceptor
    });
  });

  test('Should correctly get headers as request.headers object when use getHeaders param', () => {
    const request = createRequest({ headers: { name: 'value' } });
    const getHeadersRequestInterceptor: RequestInterceptor = ({ getHeaders }) => {
      expect(getHeaders()).toStrictEqual({ name: 'value' });
    };

    callRequestInterceptor({
      request: request as unknown as Request,
      interceptor: getHeadersRequestInterceptor
    });
  });

  test('Should correctly get cookie from request.cookies object when use getCookie param', () => {
    const request = createRequest({ cookies: { name: 'value' } });
    const getCookieRequestInterceptor: RequestInterceptor = ({ getCookie }) => {
      expect(getCookie('name')).toBe('value');
    };

    callRequestInterceptor({
      request: request as unknown as Request,
      interceptor: getCookieRequestInterceptor
    });
  });
});
