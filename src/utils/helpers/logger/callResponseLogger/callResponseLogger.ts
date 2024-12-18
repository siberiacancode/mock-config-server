import type { Request, Response } from 'express';

import type {
  Data,
  Logger,
  LoggerTokenOptions,
  LoggerTokenValues,
  RestMethod
} from '@/utils/types';

import { formatTimestamp } from '../../date';
import { filterTokenValues } from '../helpers';

const formatTokenValues = (tokenValues: Partial<LoggerTokenValues<'response'>>) => {
  const { timestamp, method } = tokenValues;

  return {
    ...tokenValues,
    ...(timestamp && { timestamp: formatTimestamp(timestamp) }),
    ...(method && { method: method.toUpperCase() })
  };
};

const DEFAULT_LOGGER_RESPONSE_TOKEN_OPTIONS: LoggerTokenOptions<'response'> = {
  type: true,
  id: true,
  timestamp: true,
  method: true,
  url: true,
  data: true
};

interface CallResponseLoggerParams {
  logger?: Logger<'response'>;
  data: Data;
  request: Request;
  response: Response;
}

export const callResponseLogger = ({
  logger,
  data,
  request,
  response
}: CallResponseLoggerParams) => {
  if (logger?.enabled === false) return null;

  const rawTokenValues: LoggerTokenValues<'response'> = {
    type: 'response',
    id: request.id,
    timestamp: Date.now(),
    method: request.method.toLowerCase() as RestMethod,
    url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
    ...(request.graphQL && {
      graphQLOperationType: request.graphQL?.operationType,
      graphQLOperationName: request.graphQL?.operationName,
      variables: request.graphQL?.variables
    }),
    statusCode: response.statusCode,
    headers: request.headers,
    cookies: request.cookies,
    query: request.query,
    params: request.params,
    body: request.body,
    data
  };

  const tokenOptions = logger?.tokenOptions ?? DEFAULT_LOGGER_RESPONSE_TOKEN_OPTIONS;

  const filteredTokenValues = filterTokenValues(rawTokenValues, tokenOptions);

  if (logger?.rewrite) {
    logger.rewrite(filteredTokenValues);
    return filteredTokenValues;
  }

  const formattedTokens = formatTokenValues(filteredTokenValues);
  console.dir(formattedTokens, { depth: null });
  return filteredTokenValues;
};
