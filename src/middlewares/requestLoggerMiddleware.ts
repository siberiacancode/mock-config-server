import c from 'ansi-colors';
import { NextFunction, Request, Response } from 'express';

import { getStatusCodeColoredString } from '../utils/helpers';
import { PlainFunction } from '../utils/types';

/**
 * Interceptor function used to monkey patch the res.send until it is invoked
 * at which point it intercepts the invocation, executes is logic such as res.contentBody = content
 * then restores the original send function and invokes that to finalize the req/res chain.
 *
 * @param res Original Response Object
 * @param send Original UNMODIFIED res.send function
 * @return A patched res.send which takes the send content, binds it to contentBody on
 * the res and then calls the original res.send after restoring it
 */
// @ts-ignore
const resDotSendInterceptor = (res, send) => (content) => {
  res.contentBody = content;
  res.send = send;
  res.send(content);
};

interface RequestLoggerMiddlewareParams {
  logger: PlainFunction;
  logHeaders: boolean;
  logQuery: boolean;
}

/**
 * Middleware which takes an initial configuration and returns a middleware which will call the
 * given logger with the request and response content.
 *
 * @param logger Logger function to pass the message to
 * @param logQuery Log query params or not
 * @param logHeaders Log headers or not
 * @return Middleware to perform the logging
 */
export const requestLoggerMiddleware =
  ({ logger, logQuery, logHeaders }: RequestLoggerMiddlewareParams) =>
  (req: Request, res: Response, next: NextFunction) => {
    const queryString = logQuery ? `query=${JSON.stringify(req.query)}\n` : '';
    const headersString = logHeaders
      ? `headers={\n${Object.keys(req.headers)
          .map((header) => `  ${c.gray(header)}: ${req.headers[header]}`)
          .join('\n')}\n`
      : '';

    logger(
      '----------------------\n',
      'REQUEST  <<<',
      req.method,
      req.url,
      '\n',
      queryString,
      headersString
    );
    // @ts-ignore
    res.send = resDotSendInterceptor(res, res.send);
    res.on('finish', () => {
      // @ts-ignore
      logger('RESPONSE >>>', getStatusCodeColoredString(res.statusCode), '\n', res.contentBody);
      logger('----------------------');
    });
    next();
  };
