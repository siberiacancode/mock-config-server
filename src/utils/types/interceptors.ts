import type { CookieOptions, Request, Response } from 'express';

export type RequestInterceptorCookie = string | undefined;
export type RequestInterceptorHeader = string | number | string[] | undefined;
export interface RequestInterceptorParams {
  request: Request;
  setDelay: (delay: number) => Promise<void>;
  getCookie: (name: string) => RequestInterceptorCookie;
  getHeader: (field: string) => RequestInterceptorHeader;
  getHeaders: (delay: number) => Record<string, RequestInterceptorHeader>;
}

export type RequestInterceptor = (params: RequestInterceptorParams) => void;

export interface ResponseInterceptorParams {
  request: Request;
  response: Response;
  setDelay: (delay: number) => Promise<void>;
  setStatusCode: (statusCode: number) => void;
  setHeader: (field: string, value?: string | string[]) => void;
  appendHeader: (field: string, value?: string[] | string) => void;
  setCookie: (name: string, value: string, options?: CookieOptions) => void;
  clearCookie: (name: string, options?: CookieOptions) => void;
  attachment: (filename: string) => void;
}

export type ResponseInterceptor<Data extends any = any> = (
  data: Data,
  params: ResponseInterceptorParams
) => any;

export interface Interceptors {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
}
