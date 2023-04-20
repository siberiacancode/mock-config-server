import { Request, Response } from 'express';

import { Data } from './values';

export interface InterceptorRequestParams {
  request: Request;
}

export type InterceptorRequest = (params: InterceptorRequestParams) => void;

export interface InterceptorResponseParams {
  request: Request;
  response: Response;
  setDelay: (delay: number) => Promise<void>;
  setStatusCode: (statusCode: number) => void;
}

export type InterceptorResponse<DataType extends Data = Data> = (data: DataType, params: InterceptorResponseParams) => any;

export interface Interceptors<DataType extends Data = Data> {
  request?: InterceptorRequest;
  response?: InterceptorResponse<DataType>;
}
