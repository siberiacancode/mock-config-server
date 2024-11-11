import type { Request } from 'express';

import type { Logger, LoggerTokenFlags, LoggerTokenValues, RestMethod } from '@/utils/types';

import { formatTimestamp } from '../../date';
import { isTokenNameMappedEntity } from '../helpers';

const formatTokenValues = (tokenValues: Partial<LoggerTokenValues<'request', 'graphql'>>) => {
  const { timestamp, method } = tokenValues;

  return {
    ...tokenValues,
    ...(timestamp && { timestamp: formatTimestamp(timestamp) }),
    ...(method && { method: method.toUpperCase() })
  };
};

const DEFAULT_LOGGER_REQUEST_TOKEN_FLAGS: LoggerTokenFlags<'request', 'graphql'> = {
  type: true,
  url: true,
  method: true,
  id: true,
  timestamp: true
};

interface CallRequestLoggerParams {
  logger: Logger<'request', 'graphql'>;
  request: Request;
}

export const callGraphQLRequestLogger = ({ logger, request }: CallRequestLoggerParams) => {
  if (!logger.enabled) return;

  const rawTokenValues: LoggerTokenValues<'request', 'graphql'> = {
    type: 'graphql request',
    url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
    method: request.method.toLowerCase() as RestMethod,
    id: request.id,
    timestamp: Date.now(),
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

  const tokenFlags: LoggerTokenFlags<'request', 'graphql'> =
    logger.tokenFlags ?? DEFAULT_LOGGER_REQUEST_TOKEN_FLAGS;

  const tokenNames = Object.keys(rawTokenValues) as (keyof LoggerTokenFlags<
    'request',
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
    {} as Partial<LoggerTokenValues<'request', 'graphql'>>
  );

  const formattedTokens = formatTokenValues(filteredTokenValues);

  console.dir(formattedTokens, { depth: null });
};
