import type { Express } from 'express';

import { asyncHandler, callRequestInterceptor } from '@/utils/helpers';
import type { RequestInterceptor } from '@/utils/types';

export const requestInterceptorMiddleware = (server: Express, interceptor: RequestInterceptor) => {
  server.use(
    asyncHandler(async (request, _response, next) => {
      await callRequestInterceptor({ request, interceptor });
      return next();
    })
  );
};
