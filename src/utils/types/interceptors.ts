import type { CookieOptions, Request, Response } from 'express';

export interface RequestInterceptorParams {
  request: Request;
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

export type ResponseInterceptor<DataType extends any = any> = (
  data: DataType,
  params: ResponseInterceptorParams
) => any;

export interface Interceptors {
  request?: RequestInterceptor;
  response?: ResponseInterceptor;
}
