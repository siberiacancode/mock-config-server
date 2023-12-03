import c from 'ansi-colors';
import type { Request } from 'express';

import type {
  RequestLogFunction,
  RequestLogFunctionParams,
  RequestLogger,
  RestMethod
} from '@/utils/types';

import { formatUnixTimestamp } from '../../date';
import { getRestMethodColoredString } from '../helpers';

const requestLogFunction: RequestLogFunction = ({ logger, tokenValues }) => {
  const {
    meta: { url, method, graphQLOperationType, graphQLOperationName, id, unixTimestamp },
    entities: { headers, cookies, query, params, variables, body }
  } = tokenValues;

  const prefix = `[${id}][REQ]`;
  const metaPrefix = `${prefix}[meta]`;
  const entitiesPrefix = `${prefix}[entities]`;

  if (logger.tokens?.meta?.url) {
    console.info(`${metaPrefix}[${c.yellow('url')}] ${url}`);
  }
  if (logger.tokens?.meta?.method) {
    console.info(`${metaPrefix}[${c.red('method')}] ${getRestMethodColoredString(method)}`);
  }
  if (logger.tokens?.meta?.graphQLOperationType) {
    console.info(`${metaPrefix}[${c.blue('graphQLOperationType')}] ${graphQLOperationType}`);
  }
  if (logger.tokens?.meta?.graphQLOperationName) {
    console.info(`${metaPrefix}[${c.green('graphQLOperationName')}] ${graphQLOperationName}`);
  }
  if (logger.tokens?.meta?.id) {
    console.info(`${metaPrefix}[${c.greenBright('id')}] ${id}`);
  }
  if (logger.tokens?.meta?.unixTimestamp) {
    console.info(`${metaPrefix}[${c.blue('timestamp')}] ${formatUnixTimestamp(unixTimestamp)}`);
  }

  if (logger.tokens?.entities?.headers) {
    console.info(`${entitiesPrefix}[${c.cyan('headers')}]\n${JSON.stringify(headers, null, 2)}`);
  }
  if (logger.tokens?.entities?.cookies) {
    console.info(`${entitiesPrefix}[${c.magenta('cookies')}]\n${JSON.stringify(cookies, null, 2)}`);
  }
  if (logger.tokens?.entities?.query) {
    console.info(`${entitiesPrefix}[${c.cyanBright('query')}]\n${JSON.stringify(query, null, 2)}`);
  }
  if (logger.tokens?.entities?.params) {
    console.info(`${entitiesPrefix}[${c.red('params')}]\n${JSON.stringify(params, null, 2)}`);
  }
  if (logger.tokens?.entities?.variables) {
    console.info(
      `${entitiesPrefix}[${c.yellow('variables')}]\n${JSON.stringify(variables, null, 2)}`
    );
  }
  if (logger.tokens?.entities?.body) {
    console.info(`${entitiesPrefix}[${c.green('body')}]\n${JSON.stringify(body, null, 2)}`);
  }

  console.info('\n\n');
};

interface CallRequestLoggerParams {
  logger: RequestLogger;
  request: Request;
}

export const callRequestLogger = async ({ logger, request }: CallRequestLoggerParams) => {
  if (!logger.enabled) return;

  const logFunctionParams: RequestLogFunctionParams = {
    logger,
    tokenValues: {
      meta: {
        url: `${request.protocol}://${request.get('host')}${request.originalUrl}`,
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
    defaultLogFunction: requestLogFunction
  };

  if (logger.logFunction) {
    await logger.logFunction(logFunctionParams);
    return;
  }
  await requestLogFunction(logFunctionParams);
};
