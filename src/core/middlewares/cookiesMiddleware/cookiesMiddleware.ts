import type { Express } from 'express';

import { parseCookie } from '@/utils/helpers';

export const cookiesMiddleware = (server: Express) => {
  server.use((request, _response, next) => {
    if (request.headers.cookie) {
      request.cookies = parseCookie(request.headers.cookie);
    }
    return next();
  });
};
