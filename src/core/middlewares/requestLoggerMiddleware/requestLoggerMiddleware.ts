import type { Express } from 'express';

import { asyncHandler, callRequestLogger } from '@/utils/helpers';
import type { RequestLogger } from '@/utils/types';

export const requestLoggerMiddleware = (server: Express, logger: RequestLogger) => {
  server.use(
    asyncHandler(async (request, _response, next) => {
      await callRequestLogger({ request, logger });
      return next();
    })
  );
};
