import type { Express } from 'express';

import { asyncHandler, callResponseLoggers } from '@/utils/helpers';
import type { ResponseLogger } from '@/utils/types';

interface ResponseLoggersMiddlewareParams {
  server: Express;
  loggers: {
    routeLogger?: ResponseLogger;
    requestLogger?: ResponseLogger;
    apiLogger?: ResponseLogger;
    serverLogger?: ResponseLogger;
  };
  path: string;
}

export const responseLoggersMiddleware = ({
  server,
  loggers,
  path = '*'
}: ResponseLoggersMiddlewareParams) => {
  server.use(
    path,
    asyncHandler(async (request, response, next) => {
      await callResponseLoggers({ request, response, loggers, data: null });
      return next();
    })
  );
};
