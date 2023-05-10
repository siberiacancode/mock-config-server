import type { Request } from 'express';

import type { RequestInterceptor, RequestInterceptorParams } from '@/utils/types';

import { parseCookie } from '../../parseCookie/parseCookie';
import { setDelay } from '../helpers/setDelay';

interface CallRequestInterceptorParams {
  request: Request;
  interceptor: RequestInterceptor;
}

export const callRequestInterceptor = async (params: CallRequestInterceptorParams) => {
  const { request, interceptor } = params;

  const getHeader = (field: string) => request.headers[field];
  const getHeaders = () => request.headers;

  const getCookie = (name: string) => {
    const { cookie } = request.headers;
    if (cookie) {
      const cookies = parseCookie(cookie);
      return cookies[name];
    }
  };

  const requestInterceptorParams: RequestInterceptorParams = {
    request,
    setDelay,
    getHeader,
    getHeaders,
    getCookie
  };

  await interceptor(requestInterceptorParams);
};
