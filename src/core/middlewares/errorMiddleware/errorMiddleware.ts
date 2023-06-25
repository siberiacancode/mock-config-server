import color from 'ansi-colors';
import type { ErrorRequestHandler, Express } from 'express';

export const errorMiddleware = (server: Express) => {
  server.use(((error, request, response, next) => {
    console.error(color.bgRed(`\nError on ${request.method} ${request.url} request\n`));

    const message = `Message: ${error.message ?? 'Internal server error'}\n\n${error.stack}`;
    response.status(error.status || 500).send(message);
    next(error);
  }) as ErrorRequestHandler);
};
