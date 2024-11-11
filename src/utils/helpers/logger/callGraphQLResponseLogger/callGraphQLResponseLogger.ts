import type { Request, Response } from 'express';

import type { Data, Logger, LoggerTokenFlags, LoggerTokenValues, RestMethod } from '@/utils/types';

import { formatTimestamp } from '../../date';
import { isTokenNameMappedEntity } from '../helpers';

const formatTokenValues = (tokenValues: Partial<LoggerTokenValues<'response', 'graphql'>>) => {
  const { timestamp, method } = tokenValues;

  return {
    ...tokenValues,
    ...(timestamp && { timestamp: formatTimestamp(timestamp) }),
    ...(method && { method: method.toUpperCase() })
  };
};

const DEFAULT_LOGGER_RESPONSE_TOKEN_FLAGS: LoggerTokenFlags<'response', 'graphql'> = {
  type: true,
  url: true,
  method: true,
  id: true,
  timestamp: true,
  data: true
};

interface CallResponseLoggerParams {
  logger: Logger<'response', 'graphql'>;
  data: Data;
  request: Request;
  response: Response;
}

export const callGraphQLResponseLogger = ({
  logger,
  data,
  request,
  response
}: CallResponseLoggerParams) => {
  if (!logger.enabled) return;

  const rawTokenValues: LoggerTokenValues<'response', 'graphql'> = {
    type: 'graphql response',
    url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
    method: request.method.toLowerCase() as RestMethod,
    id: request.id,
    timestamp: Date.now(),
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

  const tokenFlags: LoggerTokenFlags<'response', 'graphql'> =
    logger.tokenFlags ?? DEFAULT_LOGGER_RESPONSE_TOKEN_FLAGS;

  const tokenNames = Object.keys(rawTokenValues) as (keyof LoggerTokenFlags<
    'response',
    'graphql'
  >)[];

  const filteredTokenValues = tokenNames.reduce(
    (acc, tokenName) => {
      const tokenFlagValue = tokenFlags[tokenName];

      if (tokenFlagValue) {
        acc[tokenName] = rawTokenValues[tokenName];

        if (isTokenNameMappedEntity(tokenName) && typeof tokenFlagValue === 'object') {
          const mappedEntityKeys = Object.keys(tokenFlagValue);

          acc[tokenName] = mappedEntityKeys.reduce(
            (acc, mappedEntityKey) => {
              if (tokenFlagValue[mappedEntityKey]) {
                acc[mappedEntityKey] = rawTokenValues[tokenName][mappedEntityKey];
              }
              return acc;
            },
            {} as Record<string, any>
          );
        }
      }
      return acc;
    },
    {} as Partial<LoggerTokenValues<'response', 'graphql'>>
  );

  const formattedTokens = formatTokenValues(filteredTokenValues);

  console.dir(formattedTokens, { depth: null });
};
