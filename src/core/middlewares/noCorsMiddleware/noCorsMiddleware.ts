import type { Express } from 'express';

import { DEFAULT } from '@/utils/constants';

export const noCorsMiddleware = (server: Express) => {
  server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', DEFAULT.CORS.ORIGIN);
    res.setHeader('Access-Control-Allow-Credentials', `${DEFAULT.CORS.CREDENTIALS}`);
    res.setHeader('Access-Control-Expose-Headers', DEFAULT.CORS.EXPOSED_HEADERS);

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', DEFAULT.CORS.METHODS);
      res.setHeader('Access-Control-Allow-Headers', DEFAULT.CORS.ALLOWED_HEADERS);
      res.setHeader('Access-Control-Max-Age', DEFAULT.CORS.MAX_AGE);
      res.sendStatus(204);
      return res.end();
    }

    return next();
  });
};
