import type { Express } from 'express';

import { asyncHandler, callRequestInterceptor } from '@/utils/helpers';
import type { RequestInterceptor } from '@/utils/types';

interface RequestInterceptorMiddlewareParams {
  server: Express;
  path?: string;
  interceptor: RequestInterceptor;
}

export const requestInterceptorMiddleware = ({
  server,
  path = '*',
  interceptor
}: RequestInterceptorMiddlewareParams) => {
  server.use(
    path,
    asyncHandler(async (request, _response, next) => {
      await callRequestInterceptor({ request, interceptor });
      return next();
    })
  );
};
