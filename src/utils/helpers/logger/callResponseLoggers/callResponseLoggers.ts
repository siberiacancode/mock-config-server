import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { IncomingHttpHeaders } from 'http';
import type { ParsedQs } from 'qs';

import type { Data, GraphQLEntityName, ResponseLogger, RestEntityName } from '@/utils/types';

import { formatUnixTimestamp } from '../../date';

interface ResponseLogFunctionParams {
  logger: ResponseLogger<RestEntityName | GraphQLEntityName | 'data'>;
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

const responseLogFunction = ({ logger, values }: ResponseLogFunctionParams) => {
  if (!logger.enabled) return;

  console.log(`RES for request#${values.id} at ${formatUnixTimestamp(values.unixTimestamp)}`);

  if (logger.options?.headers) {
    console.log('headers=', `${JSON.stringify(values.headers)}`);
  }
  if (logger.options?.cookies) {
    console.log('cookies=', `${JSON.stringify(values.cookies)}`);
  }
  if (logger.options?.query) {
    console.log('query=', `${JSON.stringify(values.query)}`);
  }
  if (logger.options?.params) {
    console.log('params=', `${JSON.stringify(values.params)}`);
  }
  if (logger.options?.variables) {
    console.log('variables=', `${JSON.stringify(values.variables)}`);
  }
  if (logger.options?.body) {
    console.log('body=', `${JSON.stringify(values.body)}`);
  }
  console.log('----------\n\n');
};

interface CallResponseLoggerParams {
  responseLoggers?: {
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
  responseLoggers,
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

  if (responseLoggers?.routeLogger) {
    await responseLogFunction({ logger: responseLoggers.routeLogger, values, request, response });
  }
  if (responseLoggers?.requestLogger) {
    await responseLogFunction({ logger: responseLoggers.requestLogger, values, request, response });
  }
  if (responseLoggers?.apiLogger) {
    await responseLogFunction({ logger: responseLoggers.apiLogger, values, request, response });
  }
  if (responseLoggers?.serverLogger) {
    await responseLogFunction({ logger: responseLoggers.serverLogger, values, request, response });
  }
};
