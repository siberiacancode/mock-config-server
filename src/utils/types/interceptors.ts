import type { CookieOptions, Request, Response } from 'express';

import type { Logger, LoggerTokens } from './logger';
import type { ApiType } from './shared';

type InterceptorCookieValue = string | undefined;
type InterceptorHeaderValue = string | number | string[] | undefined;

export interface RequestInterceptorParams<Api extends ApiType = ApiType> {
  request: Request;
  setDelay: (delay: number) => Promise<void>;
  getCookie: (name: string) => InterceptorCookieValue;
  getHeader: (field: string) => InterceptorHeaderValue;
  getHeaders: () => Record<string, InterceptorHeaderValue>;
  log: (logger?: Logger<'request', Api>) => Partial<LoggerTokens>;
}

export type RequestInterceptor<Api extends ApiType = ApiType> = (
  params: RequestInterceptorParams<Api>
) => void | Promise<void>;

export interface ResponseInterceptorParams<Api extends ApiType = ApiType> {
  request: Request;
  response: Response;
  setDelay: (delay: number) => Promise<void>;
  setStatusCode: (statusCode: number) => void;
  setHeader: (field: string, value?: string | string[]) => void;
  appendHeader: (field: string, value?: string[] | string) => void;
  getRequestHeader: (field: string) => InterceptorHeaderValue;
  getRequestHeaders: () => Record<string, InterceptorHeaderValue>;
  getResponseHeader: (field: string) => InterceptorHeaderValue;
  getResponseHeaders: () => Record<string, InterceptorHeaderValue>;
  setCookie: (name: string, value: string, options?: CookieOptions) => void;
  getCookie: (name: string) => InterceptorCookieValue;
  clearCookie: (name: string, options?: CookieOptions) => void;
  attachment: (filename: string) => void;
  log: (logger?: Logger<'response', Api>) => Partial<LoggerTokens>;
}

export type ResponseInterceptor<Data = any, Api extends ApiType = ApiType> = (
  data: Data,
  params: ResponseInterceptorParams<Api>
) => any;

export interface Interceptors<Api extends ApiType = ApiType> {
  request?: RequestInterceptor<Api>;
  response?: ResponseInterceptor<any, Api>;
}
