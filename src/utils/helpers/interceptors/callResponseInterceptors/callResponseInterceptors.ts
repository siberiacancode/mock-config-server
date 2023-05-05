import type { CookieOptions, Request, Response } from 'express';

import type { Data, ResponseInterceptor, ResponseInterceptorParams } from '@/utils/types';

import { sleep } from '../../sleep';

interface CallResponseInterceptorsParams {
  data: Data;
  request: Request;
  response: Response;
  interceptors?: {
    routeInterceptor?: ResponseInterceptor;
    requestInterceptor?: ResponseInterceptor;
    apiInterceptor?: ResponseInterceptor;
    serverInterceptor?: ResponseInterceptor;
  };
}

export const callResponseInterceptors = (params: CallResponseInterceptorsParams) => {
  const { data, request, response, interceptors } = params;

  const setDelay = async (delay: number) => {
    await sleep(delay === Infinity ? 100000 : delay);
  };
  const setStatusCode = (statusCode: number) => {
    response.statusCode = statusCode;
  };

  const setHeader = (field: string, value?: string | string[]) => {
    response.header(field, value);
  };
  const appendHeader = (field: string, value?: string[] | string) => {
    response.append(field, value);
  };

  const setCookie = (name: string, value: string, options?: CookieOptions) => {
    if (options) {
      response.cookie(name, value, options);
      return;
    }
    response.cookie(name, value);
  };
  const clearCookie = (name: string, options?: CookieOptions) => {
    response.clearCookie(name, options);
  };

  const attachment = (filename: string) => {
    response.attachment(filename);
  };

  const ResponseInterceptorParams: ResponseInterceptorParams = {
    request,
    response,
    setDelay,
    setStatusCode,
    setHeader,
    appendHeader,
    setCookie,
    clearCookie,
    attachment
  };

  let updatedData = data;
  if (interceptors?.routeInterceptor) {
    updatedData = interceptors.routeInterceptor(updatedData, ResponseInterceptorParams);
  }
  if (interceptors?.requestInterceptor) {
    updatedData = interceptors.requestInterceptor(updatedData, ResponseInterceptorParams);
  }
  if (interceptors?.apiInterceptor) {
    updatedData = interceptors.apiInterceptor(updatedData, ResponseInterceptorParams);
  }
  if (interceptors?.serverInterceptor) {
    updatedData = interceptors.serverInterceptor(updatedData, ResponseInterceptorParams);
  }

  return updatedData;
};
