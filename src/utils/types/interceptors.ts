export interface InterceptorRequestParams {
  request: import('express').Request;
}

export type InterceptorRequest = (params: InterceptorRequestParams) => void;

export interface InterceptorResponseParams {
  request: import('express').Request;
  response: import('express').Response;
  setDelay: (delay: number) => Promise<void>;
  setStatusCode: (statusCode: number) => void;
}

export type InterceptorResponse = <Data>(data: Data, params: InterceptorResponseParams) => any;

export interface Interceptors {
  response?: InterceptorResponse;
  request?: InterceptorRequest;
}
