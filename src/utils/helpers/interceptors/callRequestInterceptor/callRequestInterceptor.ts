import type { Request } from 'express';

import type { RequestInterceptor, RequestInterceptorParams } from '@/utils/types';

import { setDelay } from '../helpers/setDelay';

interface CallRequestInterceptorParams {
  request: Request;
  interceptor: RequestInterceptor;
}

export const callRequestInterceptor = async (params: CallRequestInterceptorParams) => {
  const { request, interceptor } = params;

  const getHeader = (field: string) => request.headers[field];
  const getHeaders = () => request.headers;

  const getCookie = (name: string) => request.cookies[name];

  const requestInterceptorParams: RequestInterceptorParams = {
    request,
    setDelay,
    getHeader,
    getHeaders,
    getCookie
  };

  await interceptor(requestInterceptorParams);
};
