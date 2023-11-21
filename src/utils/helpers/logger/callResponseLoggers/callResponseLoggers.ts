import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

import type {
  Data,
  GraphQLEntityName,
  LoggerLevel,
  ResponseLogger,
  RestEntityName
} from '@/utils/types';

import { formatUnixTimestamp } from '../../date';

interface ResponseLogFunctionParams {
  logger: ResponseLogger<RestEntityName | GraphQLEntityName | 'data'>;
  level: LoggerLevel;
  values: {
    headers: IncomingHttpHeaders;
    cookies: any;
    query: ParsedQs;
    params: ParamsDictionary;
    variables: any;
    body: any;
    data: any;
    statusCode: number;
    id: number | undefined;
    unixTimestamp: number;
  };
  request: Request;
  response: Response;
}

// TODO: make pretty logs
const responseLogFunction = ({ logger, values, level }: ResponseLogFunctionParams) => {
  if (!logger.enabled) return;

  console.log(
    `LOG ${level} RES for request#${values.id} at ${formatUnixTimestamp(values.unixTimestamp)}`
  );

  // if (logger.options?.headers) {
  //   console.log('headers=', `${JSON.stringify(values.headers)}`);
  // }
  // if (logger.options?.cookies) {
  //   console.log('cookies=', `${JSON.stringify(values.cookies)}`);
  // }
  // if (logger.options?.query) {
  //   console.log('query=', `${JSON.stringify(values.query)}`);
  // }
  // if (logger.options?.params) {
  //   console.log('params=', `${JSON.stringify(values.params)}`);
  // }
  // if (logger.options?.variables) {
  //   console.log('variables=', `${JSON.stringify(values.variables)}`);
  // }
  // if (logger.options?.body) {
  //   console.log('body=', `${JSON.stringify(values.body)}`);
  // }
  // console.log('----------\n\n');
};

interface CallResponseLoggerParams {
  loggers?: {
    routeLogger?: ResponseLogger;
    requestLogger?: ResponseLogger;
    apiLogger?: ResponseLogger;
    serverLogger?: ResponseLogger;
  };
  request: Request;
  response: Response;
  data: Data;
}

export const callResponseLoggers = async ({
  loggers,
  request,
  response,
  data
}: CallResponseLoggerParams) => {
  const values: ResponseLogFunctionParams['values'] = {
    headers: request.headers,
    cookies: request.cookies,
    query: request.query,
    params: request.params,
    variables: request.query.variables,
    body: request.body,
    data,
    statusCode: response.statusCode,
    id: request.id,
    unixTimestamp: Date.now()
  };

  if (loggers?.routeLogger) {
    await responseLogFunction({
      logger: loggers.routeLogger,
      values,
      request,
      response,
      level: 'route'
    });
    return;
  }
  if (loggers?.requestLogger) {
    await responseLogFunction({
      logger: loggers.requestLogger,
      values,
      request,
      response,
      level: 'request'
    });
    return;
  }
  if (loggers?.apiLogger) {
    await responseLogFunction({
      logger: loggers.apiLogger,
      values,
      request,
      response,
      level: 'api'
    });
    return;
  }
  if (loggers?.serverLogger) {
    await responseLogFunction({
      logger: loggers.serverLogger,
      values,
      request,
      response,
      level: 'server'
    });
  }
};
