import type { CookieOptions, Request, Response } from 'express';

import type { Logger, LoggerTokens } from './logger';
import type { ApiType } from './shared';

type RequestInterceptorCookieValue = string | undefined;
type RequestInterceptorHeaderValue = string | number | string[] | undefined;
export interface RequestInterceptorParams<Api extends ApiType = ApiType> {
  request: Request;
  setDelay: (delay: number) => Promise<void>;
  getCookie: (name: string) => RequestInterceptorCookieValue;
  getHeader: (field: string) => RequestInterceptorHeaderValue;
  getHeaders: () => Record<string, RequestInterceptorHeaderValue>;
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
  getHeader: (field: string) => RequestInterceptorHeaderValue;
  getHeaders: () => Record<string, RequestInterceptorHeaderValue>;
  setCookie: (name: string, value: string, options?: CookieOptions) => void;
  getCookie: (name: string) => RequestInterceptorCookieValue;
  clearCookie: (name: string, options?: CookieOptions) => void;
  attachment: (filename: string) => void;
  log: (logger?: Logger<'response', Api>) => Partial<LoggerTokens>;
}

export type ResponseInterceptor<Api extends ApiType = ApiType, Data = any> = (
  data: Data,
  params: ResponseInterceptorParams<Api>
) => any;

export interface Interceptors<Api extends ApiType = ApiType> {
  request?: RequestInterceptor<Api>;
  response?: ResponseInterceptor<Api>;
}
