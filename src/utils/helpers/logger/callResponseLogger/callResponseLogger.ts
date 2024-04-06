import type { Request, Response } from 'express';

import type { Data, GetTokens, Logger, LoggerParams, RestMethod } from '@/utils/types';

import { getTimestamp } from '../../date';

const getTokens: GetTokens<'response'> = ({ logger, tokenValues }) => {
  const {
    meta: {
      unixTimestamp,
      id,
      statusCode,
      url,
      method,
      graphQLOperationType,
      graphQLOperationName
    },
    entities: { headers, cookies, query, params, variables, body },
    data
  } = tokenValues;

  if (!logger.tokens || !Object.keys(logger.tokens).length) {
    return {
      type: 'response',
      meta: {
        timestamp: getTimestamp(unixTimestamp),
        id,
        statusCode
      }
    };
  }

  return {
    type: 'response',
    ...(logger.tokens.meta && {
      meta: {
        ...(logger.tokens.meta.unixTimestamp && { timestamp: getTimestamp(unixTimestamp) }),
        ...(logger.tokens.meta.id && { id }),
        ...(logger.tokens.meta.method && { method }),
        ...(logger.tokens.meta.graphQLOperationType && { graphQLOperationType }),
        ...(logger.tokens.meta.graphQLOperationName && { graphQLOperationName }),
        ...(logger.tokens.meta.url && { url }),
        ...(logger.tokens.meta.statusCode && { statusCode })
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
    }),
    ...(logger.tokens.data && {
      data
    })
  };
};

interface CallResponseLoggerParams {
  logger: Logger<'response'>;
  data: Data;
  request: Request;
  response: Response;
}

export const callResponseLogger = async ({
  logger,
  request,
  response,
  data
}: CallResponseLoggerParams) => {
  if (!logger.enabled) return;

  const loggerParams: LoggerParams<'response'> = {
    logger,
    tokenValues: {
      type: 'response',
      meta: {
        unixTimestamp: Date.now(),
        id: request.id,
        url: decodeURI(`${request.protocol}://${request.get('host')}${request.originalUrl}`),
        method: request.method.toLowerCase() as RestMethod,
        graphQLOperationType: request.graphQL?.operationType,
        graphQLOperationName: request.graphQL?.operationName,
        statusCode: response.statusCode
      },
      entities: {
        headers: request.headers,
        cookies: request.cookies,
        query: request.query,
        params: request.params,
        variables: request.graphQL?.variables,
        body: request.body
      },
      data
    },
    request,
    response,
    getTokens
  };

  if (logger.logFunction) {
    await logger.logFunction(loggerParams);
    return;
  }
  const tokens = await getTokens(loggerParams);
  console.dir(tokens, { depth: null });
};
