import type { Request } from 'express';

import type { Logger, LoggerTokenFlags, LoggerTokenValues, RestMethod } from '@/utils/types';

import { formatTimestamp } from '../../date';
import { filterTokenValues } from '../helpers';

const formatTokenValues = (tokenValues: Partial<LoggerTokenValues<'request'>>) => {
  const { timestamp, method } = tokenValues;

  return {
    ...tokenValues,
    ...(timestamp && { timestamp: formatTimestamp(timestamp) }),
    ...(method && { method: method.toUpperCase() })
  };
};

const DEFAULT_LOGGER_REQUEST_TOKEN_FLAGS: LoggerTokenFlags<'request'> = {
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
  if (logger?.enabled === false) return;

  const rawTokenValues: LoggerTokenValues<'request'> = {
    type: 'request',
    id: request.id,
    timestamp: Date.now(),
    method: request.method.toLowerCase() as RestMethod,
    url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
    ...(request.graphQL && {
      graphQLOperationType: request.graphQL?.operationType,
      graphQLOperationName: request.graphQL?.operationName,
      variables: request.graphQL?.variables
    }),
    headers: request.headers,
    cookies: request.cookies,
    query: request.query,
    params: request.params,
    body: request.body
  };

  const tokenFlags = logger?.tokenFlags ?? DEFAULT_LOGGER_REQUEST_TOKEN_FLAGS;

  const filteredTokenValues = filterTokenValues(rawTokenValues, tokenFlags);

  if (logger?.rewrite) {
    logger.rewrite(filteredTokenValues);
    return;
  }

  const formattedTokens = formatTokenValues(filteredTokenValues);
  console.dir(formattedTokens, { depth: null });
};
