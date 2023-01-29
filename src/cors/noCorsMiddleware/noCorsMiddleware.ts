import type { Express } from 'express';

import { DEFAULT } from '../../utils/constants';

export const noCorsMiddleware = (server: Express) => {
  server.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', DEFAULT.CORS.ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', DEFAULT.CORS.METHODS);
    res.setHeader('Access-Control-Allow-Headers', DEFAULT.CORS.HEADERS);
    res.setHeader('Access-Control-Allow-Credentials', `${DEFAULT.CORS.CREDENTIALS}`);
    res.setHeader('Access-Control-Max-Age', DEFAULT.CORS.MAX_AGE);

    return next();
  });
};
