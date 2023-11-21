import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

import type { GraphQLEntityName, LoggerLevel, RequestLogger, RestEntityName } from '@/utils/types';

import { formatUnixTimestamp } from '../../date';

interface RequestLogFunctionParams {
  logger: RequestLogger<RestEntityName | GraphQLEntityName>;
  level: LoggerLevel;
  values: {
    headers: IncomingHttpHeaders;
    cookies: any;
    query: ParsedQs;
    params: ParamsDictionary;
    variables: any;
    body: any;
    id: number;
    unixTimestamp: number;
  };
  request: Request;
}

// TODO: make pretty logs
const requestLogFunction = ({ logger, values, level }: RequestLogFunctionParams) => {
  if (!logger.enabled) return;

  console.log(
    `LOG ${level} REQ for request#${values.id} at ${formatUnixTimestamp(values.unixTimestamp)}`
  );

  // if (logger.options?.headers) {
  //   console.log('headers=', `${JSON.stringify(values.headers, null, 2)}\n`);
  // }
  // if (logger.options?.cookies) {
  //   console.log('cookies=', `${JSON.stringify(values.cookies, null, 2)}\n`);
  // }
  // if (logger.options?.query) {
  //   console.log('query=', `${JSON.stringify(values.query, null, 2)}\n`);
  // }
  // if (logger.options?.params) {
  //   console.log('params=', `${JSON.stringify(values.params, null, 2)}\n`);
  // }
  // if (logger.options?.variables) {
  //   console.log('variables=', `${JSON.stringify(values.variables, null, 2)}\n`);
  // }
  // if (logger.options?.body) {
  //   console.log('body=', `${JSON.stringify(values.body, null, 2)}\n`);
  // }
  // console.log('----------\n\n');
};

interface CallRequestLoggerParams {
  logger: RequestLogger;
  request: Request;
  level: LoggerLevel;
}

// TODO: add custom loggerFunction support
export const callRequestLogger = async ({ logger, request, level }: CallRequestLoggerParams) => {
  if (request.resolvedRequestLoggerLevel) return;

  const logFunctionParams: RequestLogFunctionParams = {
    logger,
    level,
    values: {
      headers: request.headers,
      cookies: request.cookies,
      query: request.query,
      params: request.params,
      variables: request.query.variables,
      body: request.body,
      id: request.id,
      unixTimestamp: request.unixTimestamp
    },
    request
  };

  await requestLogFunction(logFunctionParams);
  request.resolvedRequestLoggerLevel = level;
};
