import type { Request } from 'express';

import type { GetTokens, Logger, LoggerParams, RestMethod } from '@/utils/types';

import { getTimestamp } from '../../date';

const getTokens: GetTokens<'request'> = ({ logger, tokenValues }) => {
  const {
    meta: { unixTimestamp, id, url, method, graphQLOperationType, graphQLOperationName },
    entities: { headers, cookies, query, params, variables, body }
  } = tokenValues;

  if (!logger.tokens || !Object.keys(logger.tokens).length) {
    return {
      type: 'request',
      meta: {
        timestamp: getTimestamp(unixTimestamp),
        id,
        method,
        url
      }
    };
  }

  return {
    type: 'request',
    ...(logger.tokens.meta && {
      meta: {
        ...(logger.tokens.meta.unixTimestamp && { timestamp: getTimestamp(unixTimestamp) }),
        ...(logger.tokens.meta.id && { id }),
        ...(logger.tokens.meta.method && { method }),
        ...(logger.tokens.meta.graphQLOperationType && { graphQLOperationType }),
        ...(logger.tokens.meta.graphQLOperationName && { graphQLOperationName }),
        ...(logger.tokens.meta.url && { url })
      }
    }),
    ...(logger.tokens.entities && {
      entities: {
        ...(logger.tokens.entities.headers && { headers }),
        ...(logger.tokens.entities.cookies && { cookies }),
        ...(logger.tokens.entities.query && { query }),
        ...(logger.tokens.entities.params && { params }),
        ...(logger.tokens.entities.variables && { variables }),
        ...(logger.tokens.entities.body && { body })
      }
    })
  };
};

interface CallRequestLoggerParams {
  logger: Logger<'request'>;
  request: Request;
}

export const callRequestLogger = async ({ logger, request }: CallRequestLoggerParams) => {
  if (!logger.enabled) return;

  const loggerParams: LoggerParams<'request'> = {
    logger,
    tokenValues: {
      type: 'request',
      meta: {
        url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
        method: request.method.toLowerCase() as RestMethod,
        graphQLOperationType: request.graphQL?.operationType,
        graphQLOperationName: request.graphQL?.operationName,
        id: request.id,
        unixTimestamp: Date.now()
      },
      entities: {
        headers: request.headers,
        cookies: request.cookies,
        query: request.query,
        params: request.params,
        variables: request.graphQL?.variables,
        body: request.body
      }
    },
    request,
    getTokens
  };

  if (logger.logFunction) {
    await logger.logFunction(loggerParams);
    return;
  }
  const tokens = await getTokens(loggerParams);
  console.dir(tokens, { depth: null });
};
