import type { Express } from 'express';

declare global {
  namespace Express {
    export interface Request {
      id: number;
      unixTimestamp: number;
    }
  }
}

export const requestInfoMiddleware = (server: Express) => {
  let requestId = 0;

  server.use((request, _response, next) => {
    requestId += 1;
    request.id = requestId;

    request.unixTimestamp = Date.now();

    return next();
  });
};
