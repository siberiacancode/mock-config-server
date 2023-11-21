import type { Express } from 'express';

import { asyncHandler, callRequestLogger } from '@/utils/helpers';
import type { LoggerLevel, RequestLogger } from '@/utils/types';

export const requestLoggerMiddleware = (
  server: Express,
  logger: RequestLogger,
  level: LoggerLevel,
  path: string = '*'
) => {
  server.use(
    path,
    asyncHandler(async (request, _response, next) => {
      await callRequestLogger({ request, logger, level });
      return next();
    })
  );
};
