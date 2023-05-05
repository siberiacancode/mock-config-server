import type { Request } from 'express';

import type { RequestInterceptor } from '@/utils/types';

interface CallRequestInterceptorsParams {
  request: Request;
  interceptors?: {
    requestInterceptor?: RequestInterceptor;
    apiInterceptor?: RequestInterceptor;
    serverInterceptor?: RequestInterceptor;
  };
}

export const callRequestInterceptors = (params: CallRequestInterceptorsParams) => {
  const { request, interceptors } = params;
  if (interceptors?.requestInterceptor) interceptors.requestInterceptor({ request });
  if (interceptors?.apiInterceptor) interceptors.apiInterceptor({ request });
  if (interceptors?.serverInterceptor) interceptors.serverInterceptor({ request });
};
