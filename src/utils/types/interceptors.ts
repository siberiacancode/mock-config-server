import type { CookieOptions, Request, Response } from 'express';

export interface InterceptorRequestParams {
  request: Request;
}

export type InterceptorRequest = (params: InterceptorRequestParams) => void;

export interface InterceptorResponseParams {
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

export type InterceptorResponse<DataType extends any = any> = (
  data: DataType,
  params: InterceptorResponseParams
) => any;

export interface Interceptors {
  request?: InterceptorRequest;
  response?: InterceptorResponse;
}
