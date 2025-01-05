import type { Request, Response } from 'express';

import type { Data, ResponseInterceptor, ResponseInterceptorParams } from '@/utils/types';

import { callResponseLogger } from '../../logger';
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

  const getHeader: ResponseInterceptorParams['getHeader'] = (field) => response.getHeader(field);
  const getHeaders: ResponseInterceptorParams['getHeaders'] = () => response.getHeaders();
  const setHeader: ResponseInterceptorParams['setHeader'] = (field, value) => {
    response.set(field, value);
  };
  const appendHeader: ResponseInterceptorParams['appendHeader'] = (field, value) => {
    response.append(field, value);
  };

  const setStatusCode: ResponseInterceptorParams['setStatusCode'] = (statusCode) => {
    response.statusCode = statusCode;
  };

  const getCookie: ResponseInterceptorParams['getCookie'] = (name) => request.cookies[name];
  const setCookie: ResponseInterceptorParams['setCookie'] = (name, value, options) => {
    if (options) {
      response.cookie(name, value, options);
      return;
    }
    response.cookie(name, value);
  };
  const clearCookie: ResponseInterceptorParams['clearCookie'] = (name, options) => {
    response.clearCookie(name, options);
  };

  const attachment: ResponseInterceptorParams['attachment'] = (filename) => {
    response.attachment(filename);
  };

  const log: ResponseInterceptorParams['log'] = (logger) =>
    callResponseLogger({ logger, data, request, response });

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
    attachment,
    log
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
