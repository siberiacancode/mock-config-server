import type { Express } from 'express';

import { asyncHandler, callResponseInterceptors } from '@/utils/helpers';
import type { ResponseInterceptor } from '@/utils/types';

interface ResponseInterceptorsMiddlewareParams {
  server: Express;
  interceptors: {
    routeInterceptor?: ResponseInterceptor;
    requestInterceptor?: ResponseInterceptor;
    apiInterceptor?: ResponseInterceptor;
    serverInterceptor?: ResponseInterceptor;
  };
  path: string;
}

export const responseInterceptorsMiddleware = ({
  server,
  interceptors,
  path = '*'
}: ResponseInterceptorsMiddlewareParams) => {
  server.use(
    path,
    asyncHandler(async (request, response, next) => {
      await callResponseInterceptors({ request, response, interceptors, data: null });
      return next();
    })
  );
};
