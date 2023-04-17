import type { Express } from 'express';

import { DEFAULT } from '@/utils/constants';
import type { Cors, CorsOrigin } from '@/utils/types';

import { getAllowedOrigins } from './helpers';

export const corsMiddleware = (server: Express, cors: Cors) => {
  server.use(async (req, res, next) => {
    if (Array.isArray(cors.origin) && !cors.origin.length) {
      return next();
    }

    let allowedOrigins: CorsOrigin[] = [];

    if (typeof cors.origin === 'function') {
      const origins = await cors.origin(req);
      allowedOrigins = getAllowedOrigins(origins);
    } else {
      allowedOrigins = getAllowedOrigins(cors.origin);
    }

    const { origin } = req.headers;

    if (!allowedOrigins?.length || !origin) {
      return next();
    }

    const isRequestOriginAllowed = allowedOrigins.some((allowedOrigin) => {
      if (allowedOrigin instanceof RegExp) {
        return new RegExp(allowedOrigin).test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isRequestOriginAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader(
        'Access-Control-Allow-Credentials',
        `${cors.credentials ?? DEFAULT.CORS.CREDENTIALS}`
      );
      res.setHeader(
        'Access-Control-Expose-Headers',
        cors.exposedHeaders ?? DEFAULT.CORS.EXPOSED_HEADERS
      );

      if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', cors.methods ?? DEFAULT.CORS.METHODS);
        res.setHeader(
          'Access-Control-Allow-Headers',
          cors.allowedHeaders ?? DEFAULT.CORS.ALLOWED_HEADERS
        );
        res.setHeader('Access-Control-Max-Age', cors.maxAge ?? DEFAULT.CORS.MAX_AGE);
        res.sendStatus(204);
        return res.end();
      }
    }

    return next();
  });
};
