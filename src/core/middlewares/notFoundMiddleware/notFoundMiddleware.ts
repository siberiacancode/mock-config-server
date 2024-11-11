import type { Express } from 'express';

import {
  callGraphQLRequestLogger,
  callGraphQLResponseLogger,
  callRestRequestLogger,
  callRestResponseLogger,
  parseGraphQLRequest
} from '@/utils/helpers';
import type {
  MockServerConfig,
  OperationNameGraphQLRequestConfig,
  RestPathString
} from '@/utils/types';

import type { GraphqlRequestSuggestionConfigs, RestRequestSuggestionConfigs } from './helpers';
import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './helpers';

export const notFoundMiddleware = (
  server: Express,
  mockServerConfig: Pick<MockServerConfig, 'baseUrl' | 'rest' | 'graphql' | 'loggers'>
) => {
  const { baseUrl: serverBaseUrl, rest, graphql } = mockServerConfig;

  const restRequestConfigs =
    rest?.configs
      .filter(({ path }) => !(path instanceof RegExp))
      .map((request) => ({
        method: request.method,
        path: `${serverBaseUrl ?? ''}${rest?.baseUrl ?? ''}${request.path}` as RestPathString
      })) ?? [];

  const graphqlRequestConfigs =
    graphql?.configs
      .filter((request) => 'operationName' in request && !(request.operationName instanceof RegExp))
      .map((request) => ({
        operationType: request.operationType,
        operationName: `${serverBaseUrl ?? ''}${graphql?.baseUrl ?? ''} ${
          (request as OperationNameGraphQLRequestConfig).operationName
        }`
      })) ?? [];

  server.use((request, response) => {
    const requestLogger = mockServerConfig.loggers?.request;
    if (requestLogger) {
      if (request.graphQL) {
        callGraphQLRequestLogger({ request, logger: requestLogger });
      } else {
        callRestRequestLogger({ request, logger: requestLogger });
      }
    }

    const url = new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`);

    let restRequestSuggestions: RestRequestSuggestionConfigs = [];
    if (rest) {
      restRequestSuggestions = getRestUrlSuggestions({
        url,
        requestConfigs: restRequestConfigs
      });
    }

    let graphqlRequestSuggestions: GraphqlRequestSuggestionConfigs = [];
    if (graphql && parseGraphQLRequest(request)) {
      graphqlRequestSuggestions = getGraphqlUrlSuggestions({
        url,
        requestConfigs: graphqlRequestConfigs
      });
    }

    response.status(404);
    const responseLogger = mockServerConfig.loggers?.response;
    if (responseLogger) {
      if (request.graphQL) {
        callGraphQLResponseLogger({ request, response, logger: responseLogger, data: undefined });
      } else {
        callRestResponseLogger({ request, response, logger: responseLogger, data: undefined });
      }
    }

    const isRequestSupportHtml =
      request.headers.accept?.includes('text/html') || request.headers.accept?.includes('*/*');
    if (isRequestSupportHtml) {
      response.render('pages/404', {
        restRequestSuggestions,
        graphqlRequestSuggestions
      });
      return;
    }

    response.json({
      message: 'Request or page not found. Similar requests in data',
      data: {
        restRequestSuggestions,
        graphqlRequestSuggestions
      }
    });
  });
};
