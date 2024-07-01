import type { CookieOptions, Request, Response } from 'express';

type InterceptorCookieValue = string | undefined;
type InterceptorHeaderValue = string | number | string[] | undefined;
export interface RequestInterceptorParams {
  request: Request;
  setDelay: (delay: number) => Promise<void>;
  getCookie: (name: string) => InterceptorCookieValue;
  getHeader: (field: string) => InterceptorHeaderValue;
  getHeaders: () => Record<string, InterceptorHeaderValue>;
}

export type RequestInterceptor = (params: RequestInterceptorParams) => void | Promise<void>;

export interface ResponseInterceptorParams {
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
}

export type ResponseInterceptor<Data = any> = (
  data: Data,
  params: ResponseInterceptorParams
) => any;

export interface Interceptors {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
}
