import type { Request } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

import type { GraphQLEntityName, RequestLogger, RestEntityName } from '@/utils/types';

import { formatUnixTimestamp } from '../../date';

interface RequestLogFunctionParams {
  logger: RequestLogger<RestEntityName | GraphQLEntityName>;
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

const requestLogFunction = ({ logger, values }: RequestLogFunctionParams) => {
  if (!logger.enabled) return;

  console.log(
    `REQ for request#${values.id} at ${formatUnixTimestamp(values.unixTimestamp)}`,
    logger
  );

  if (logger.options?.headers) {
    console.log('headers=', `${JSON.stringify(values.headers, null, 2)}\n`);
  }
  if (logger.options?.cookies) {
    console.log('cookies=', `${JSON.stringify(values.cookies, null, 2)}\n`);
  }
  if (logger.options?.query) {
    console.log('query=', `${JSON.stringify(values.query, null, 2)}\n`);
  }
  if (logger.options?.params) {
    console.log('params=', `${JSON.stringify(values.params, null, 2)}\n`);
  }
  if (logger.options?.variables) {
    console.log('variables=', `${JSON.stringify(values.variables, null, 2)}\n`);
  }
  if (logger.options?.body) {
    console.log('body=', `${JSON.stringify(values.body, null, 2)}\n`);
  }
  console.log('----------\n\n');
};

interface CallRequestLoggerParams {
  logger: RequestLogger;
  request: Request;
}

export const callRequestLogger = async ({ logger, request }: CallRequestLoggerParams) => {
  console.log('callRequestLogger params=', request.params, typeof request.params);
  const logFunctionParams: RequestLogFunctionParams = {
    logger,
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
};

// хотим ли мы реквест и респонс логгеры отдельно как у интерцепторов
// хотим ли чтобы вызывался самый близкий к текущему запросу лог
