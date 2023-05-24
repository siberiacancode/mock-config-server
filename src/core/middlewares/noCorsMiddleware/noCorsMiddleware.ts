import type { Express } from 'express';

import { DEFAULT } from '@/utils/constants';

export const noCorsMiddleware = (server: Express) => {
  server.use((request, response, next) => {
    const { origin } = request.headers;
    if (!origin) return next();

    const allowedHeaders = Object.keys(request.headers).join(', ');
    const exposedHeaders = Object.keys(request.headers).join(', ');

    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Expose-Headers', exposedHeaders);
    response.setHeader('Access-Control-Allow-Credentials', `${DEFAULT.CORS.CREDENTIALS}`);

    const isPreflightRequest =
      request.method === 'OPTIONS' &&
      request.headers.origin &&
      request.headers['access-control-request-method'] &&
      request.headers['access-control-request-headers'];

    if (isPreflightRequest) {
      response.setHeader('Access-Control-Allow-Headers', allowedHeaders);
      response.setHeader('Access-Control-Allow-Methods', DEFAULT.CORS.METHODS);
      response.setHeader('Access-Control-Max-Age', DEFAULT.CORS.MAX_AGE);
      response.sendStatus(204);
      return response.end();
    }

    return next();
  });
};
