import type { Request } from 'express';

import type { Data, RequestInterceptor, RequestInterceptorParams } from '@/utils/types';

import { setDelay } from '../helpers/setDelay';

interface CallRequestInterceptorsParams {
  data: Data;
  request: Request;
  interceptors?: {
    routeInterceptor?: RequestInterceptor;
    requestInterceptor?: RequestInterceptor;
    apiInterceptor?: RequestInterceptor;
    serverInterceptor?: RequestInterceptor;
  };
}

export const callRequestInterceptors = async (params: CallRequestInterceptorsParams) => {
  const { request, interceptors } = params;

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

  if (interceptors?.routeInterceptor) {
    await interceptors.routeInterceptor(requestInterceptorParams);
  }
  if (interceptors?.requestInterceptor) {
    await interceptors.requestInterceptor(requestInterceptorParams);
  }
  if (interceptors?.apiInterceptor) {
    await interceptors.apiInterceptor(requestInterceptorParams);
  }
  if (interceptors?.serverInterceptor) {
    await interceptors.serverInterceptor(requestInterceptorParams);
  }
};
