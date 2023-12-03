import c from 'ansi-colors';
import type { Request, Response } from 'express';

import type {
  Data,
  ResponseLogFunction,
  ResponseLogFunctionParams,
  ResponseLogger,
  RestMethod
} from '@/utils/types';

import { formatUnixTimestamp } from '../../date';
import { getRestMethodColoredString, getStatusCodeColoredString } from '../helpers';

const responseLogFunction: ResponseLogFunction = ({ logger, tokenValues }) => {
  const {
    meta: {
      url,
      method,
      graphQLOperationType,
      graphQLOperationName,
      statusCode,
      id,
      unixTimestamp
    },
    entities: { headers, cookies, query, params, variables, body },
    data
  } = tokenValues;

  const prefix = `[${id}][RES]`;
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
  if (logger.tokens?.meta?.statusCode) {
    console.info(
      `${metaPrefix}[${c.yellowBright('statusCode')}] ${getStatusCodeColoredString(statusCode)}`
    );
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

  if (logger.tokens?.data) {
    console.info(`${prefix}[${c.yellow('data')}]\n${JSON.stringify(data, null, 2)}`);
  }

  console.info('\n\n');
};

interface CallResponseLoggerParams {
  logger: ResponseLogger;
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

  const logFunctionParams: ResponseLogFunctionParams = {
    logger,
    tokenValues: {
      meta: {
        url: `${request.protocol}://${request.get('host')}${request.originalUrl}`,
        method: request.method.toLowerCase() as RestMethod,
        graphQLOperationType: request.graphQL?.operationType,
        graphQLOperationName: request.graphQL?.operationName,
        statusCode: response.statusCode,
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
      },
      data
    },
    request,
    response,
    defaultLogFunction: responseLogFunction
  };

  if (logger.logFunction) {
    await logger.logFunction(logFunctionParams);
    return;
  }
  await responseLogFunction(logFunctionParams);
};
