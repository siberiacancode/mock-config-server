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
  setHeader: (...params: Parameters<Response['header']>) => void;
  appendHeader: (...params: Parameters<Response['append']>) => void;
  setCookie: (...params: Parameters<Response['cookie']>) => void;
  clearCookie: (...params: Parameters<Response['clearCookie']>) => void;
  attachment: (...params: Parameters<Response['attachment']>) => void;
}

export type InterceptorResponse = <Data>(data: Data, params: InterceptorResponseParams) => any;

export interface Interceptors {
  request?: InterceptorRequest;
  response?: InterceptorResponse;
}
