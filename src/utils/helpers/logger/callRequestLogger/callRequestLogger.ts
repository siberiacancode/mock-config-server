import type { Request } from 'express';

import type { Logger, LoggerTokenOptions, LoggerTokenValues, RestMethod } from '@/utils/types';

import { filterTokenValues, formatTokenValues } from '../helpers';

const DEFAULT_LOGGER_REQUEST_TOKEN_OPTIONS: LoggerTokenOptions<'request'> = {
  type: true,
  id: true,
  timestamp: true,
  method: true,
  url: true
};

interface CallRequestLoggerParams {
  logger?: Logger<'request'>;
  request: Request;
}

export const callRequestLogger = ({ logger, request }: CallRequestLoggerParams) => {
  if (logger?.enabled === false) return null;

  const rawTokenValues: LoggerTokenValues<'request'> = {
    type: 'request',
    id: request.id,
    timestamp: request.timestamp,
    method: request.method.toLowerCase() as RestMethod,
    url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
    graphQLOperationType: request.graphQL?.operationType ?? null,
    graphQLOperationName: request.graphQL?.operationName ?? null,
    variables: request.graphQL?.variables ?? null,
    headers: request.headers,
    cookies: request.cookies,
    query: request.query,
    params: request.params,
    body: request.body
  };

  const tokenOptions = logger?.tokenOptions ?? DEFAULT_LOGGER_REQUEST_TOKEN_OPTIONS;

  const filteredTokenValues = filterTokenValues(rawTokenValues, tokenOptions);

  if (logger?.rewrite) {
    logger.rewrite(filteredTokenValues);
    return filteredTokenValues;
  }

  const formattedTokens = formatTokenValues(filteredTokenValues);
  console.dir(formattedTokens, { depth: null });
  return filteredTokenValues;
};
