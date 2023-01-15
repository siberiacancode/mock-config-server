import type { Request } from 'express';

import { InterceptorRequest } from '../../utils/types';

interface CallRequestInterceptorsParams {
  request: Request;
  interceptors?: {
    routeInterceptor?: InterceptorRequest | undefined;
    requestInterceptor?: InterceptorRequest | undefined;
    serverInterceptor?: InterceptorRequest | undefined;
  };
}

export const callRequestInterceptors = (params: CallRequestInterceptorsParams) => {
  const { request, interceptors } = params;
  if (interceptors?.routeInterceptor) interceptors.routeInterceptor({ request });
  if (interceptors?.requestInterceptor) interceptors.requestInterceptor({ request });
  if (interceptors?.serverInterceptor) interceptors.serverInterceptor({ request });
};
