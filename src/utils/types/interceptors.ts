import type { CookieOptions, Request, Response } from 'express';

type RequestInterceptorCookieValue = string | undefined;
type RequestInterceptorHeaderValue = string | number | string[] | undefined;
export interface RequestInterceptorParams {
  request: Request;
  setDelay: (delay: number) => Promise<void>;
  getCookie: (name: string) => RequestInterceptorCookieValue;
  getHeader: (field: string) => RequestInterceptorHeaderValue;
  getHeaders: () => Record<string, RequestInterceptorHeaderValue>;
}

export type RequestInterceptor = (params: RequestInterceptorParams) => void;

export interface ResponseInterceptorParams {
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
}

export type ResponseInterceptor<Data = any> = (
  data: Data,
  params: ResponseInterceptorParams
) => any;

export interface Interceptors {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
}
