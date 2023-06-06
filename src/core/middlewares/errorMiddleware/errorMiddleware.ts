import color from 'ansi-colors';
import type { ErrorRequestHandler, Express } from 'express';

export const errorMiddleware = (server: Express) => {
  server.use(((error, request, response, next) => {
    console.log('\n');
    console.error(color.bgRed(`Error on ${request.method} ${request.url} request\n`));

    response.status(error.status || 500).send(error.stack ?? 'Internal server error');
    next(error);
  }) as ErrorRequestHandler);
};
