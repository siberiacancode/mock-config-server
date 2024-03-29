import type { CookieOptions, Request, Response } from 'express';

import type { Data, ResponseInterceptor, ResponseInterceptorParams } from '@/utils/types';

import { setDelay } from '../helpers/setDelay';

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

export const callResponseInterceptors = async (params: CallResponseInterceptorsParams) => {
  const { data, request, response, interceptors } = params;

  const getHeader = (field: string) => response.getHeader(field);
  const getHeaders = () => response.getHeaders();
  const setHeader = (field: string, value?: string | string[]) => {
    response.set(field, value);
  };
  const appendHeader = (field: string, value?: string | string[]) => {
    response.append(field, value);
  };

  const setStatusCode = (statusCode: number) => {
    response.statusCode = statusCode;
  };

  const getCookie = (name: string) => request.cookies[name];
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

  const responseInterceptorParams: ResponseInterceptorParams = {
    request,
    response,
    setDelay,
    setStatusCode,
    setHeader,
    appendHeader,
    getHeader,
    getHeaders,
    setCookie,
    getCookie,
    clearCookie,
    attachment
  };

  let updatedData = data;
  if (interceptors?.routeInterceptor) {
    updatedData = await interceptors.routeInterceptor(updatedData, responseInterceptorParams);
  }
  if (interceptors?.requestInterceptor) {
    updatedData = await interceptors.requestInterceptor(updatedData, responseInterceptorParams);
  }
  if (interceptors?.apiInterceptor) {
    updatedData = await interceptors.apiInterceptor(updatedData, responseInterceptorParams);
  }
  if (interceptors?.serverInterceptor) {
    updatedData = await interceptors.serverInterceptor(updatedData, responseInterceptorParams);
  }

  return updatedData;
};
