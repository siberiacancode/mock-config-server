import type { Express } from 'express';

import { DEFAULT } from '../../utils/constants';
import type { Cors } from '../../utils/types';
import { getAllowedOrigins } from '../getOrigins/getAllowedOrigins';

export const corsMiddleware = async (server: Express, cors: Cors) => {
  server.use(async (req, res, next) => {
    if (Array.isArray(cors.origin) && !cors.origin.length) {
      return next();
    }

    const allowedOrigins = await getAllowedOrigins(cors.origin);
    const { origin } = req.headers;

    if (!allowedOrigins?.length || !origin) {
      return next();
    }

    const isAllowedOrigin = allowedOrigins.some((allowedOrigin) => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin.includes(origin);
      }
      return allowedOrigin.test(origin);
    });

    if (isAllowedOrigin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', cors.methods ?? DEFAULT.CORS.METHODS);
      res.setHeader('Access-Control-Allow-Headers', cors.headers ?? DEFAULT.CORS.HEADERS);
      res.setHeader(
        'Access-Control-Allow-Credentials',
        `${cors.credentials ?? DEFAULT.CORS.CREDENTIALS}`
      );
      res.setHeader('Access-Control-Max-Age', cors.maxAge ?? DEFAULT.CORS.MAX_AGE);
    }

    if (req.method === 'OPTIONS') {
      // ✅ important:
      // Safari (and potentially other browsers) need content-length 0,
      // for 204 or they just hang waiting for a body
      res.setHeader('Content-Length', '0');
      res.sendStatus(204);
      return res.end();
    }

    next();
  });
};
