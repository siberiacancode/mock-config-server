import type { Request, Response } from 'express';

export interface InterceptorRequestParams {
  request: Request;
}

export type InterceptorRequest = (params: InterceptorRequestParams) => void;

export interface InterceptorResponseParams {
  request: Request;
  response: Response;
  setDelay: (delay: number) => Promise<void>;
  setStatusCode: (statusCode: number) => void;
  setHeader: (...args: Parameters<Response['header']>) => void;
  appendHeader: (...args: Parameters<Response['append']>) => void;
  setCookie: (...args: Parameters<Response['cookie']>) => void;
  clearCookie: (...args: Parameters<Response['clearCookie']>) => void;
  attachment: (...args: Parameters<Response['attachment']>) => void;
}

export type InterceptorResponse = <Data>(data: Data, params: InterceptorResponseParams) => any;

export interface Interceptors {
  request?: InterceptorRequest;
  response?: InterceptorResponse;
}
