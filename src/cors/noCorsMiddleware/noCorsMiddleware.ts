import type { Express } from 'express';

import { DEFAULT } from '../../utils/constants';

export const noCorsMiddleware = async (server: Express) => {
  server.use(async (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', DEFAULT.CORS.ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', DEFAULT.CORS.METHODS);
    res.setHeader('Access-Control-Allow-Headers', DEFAULT.CORS.HEADERS);
    res.setHeader('Access-Control-Allow-Credentials', `${DEFAULT.CORS.CREDENTIALS}`);
    res.setHeader('Access-Control-Max-Age', DEFAULT.CORS.MAX_AGE);

    if (req.method === 'OPTIONS') {
      // ✅ important:
      // Safari (and potentially other browsers) need content-length 0,
      // for 204 or they just hang waiting for a body
      res.setHeader('Content-Length', '0');
      res.sendStatus(204);
      return res.end();
    }

    return next();
  });
};
