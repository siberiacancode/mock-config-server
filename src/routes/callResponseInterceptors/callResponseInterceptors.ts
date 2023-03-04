import type { Request, Response } from 'express';

import { sleep } from '../../utils/helpers';
import type { InterceptorResponse, InterceptorResponseParams } from '../../utils/types';

interface CallResponseInterceptorsParams<T> {
  data: T;
  request: Request;
  response: Response;
  interceptors?: {
    routeInterceptor?: InterceptorResponse | undefined;
    requestInterceptor?: InterceptorResponse | undefined;
    serverInterceptor?: InterceptorResponse | undefined;
  };
}

export const callResponseInterceptors = <T = unknown>(
  params: CallResponseInterceptorsParams<T>
) => {
  const { data, request, response, interceptors } = params;
  const setDelay = async (delay: number) => {
    await sleep(delay === Infinity ? 100000 : delay);
  };
  const setStatusCode = (statusCode: number) => {
    response.statusCode = statusCode;
  };

  const interceptorResponseParams: InterceptorResponseParams = {
    request,
    response,
    setDelay,
    setStatusCode
  };

  let updatedData = data;
  if (interceptors?.routeInterceptor) {
    updatedData = interceptors.routeInterceptor(updatedData, interceptorResponseParams);
  }
  if (interceptors?.requestInterceptor) {
    updatedData = interceptors.requestInterceptor(updatedData, interceptorResponseParams);
  }
  if (interceptors?.serverInterceptor) {
    updatedData = interceptors.serverInterceptor(updatedData, interceptorResponseParams);
  }

  return updatedData;
};
