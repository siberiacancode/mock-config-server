import type { Express } from 'express';

import {
  asyncHandler,
  callRequestLogger,
  callResponseLogger,
  parseGraphQLRequest
} from '@/utils/helpers';
import type { MockServerConfig, RestPathString } from '@/utils/types';

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
      .filter(({ operationName }) => !(operationName instanceof RegExp))
      .map((request) => ({
        operationType: request.operationType,
        operationName: `${serverBaseUrl ?? ''}${graphql?.baseUrl ?? ''} ${request.operationName}`
      })) ?? [];

  server.use(
    asyncHandler(async (request, response) => {
      const requestLogger = mockServerConfig.loggers?.request;
      if (requestLogger) {
        await callRequestLogger({ request, logger: requestLogger });
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
        await callResponseLogger({ request, response, logger: responseLogger, data: undefined });
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
    })
  );
};
