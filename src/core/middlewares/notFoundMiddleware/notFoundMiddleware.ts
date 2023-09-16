import type { Express } from 'express';

import { parseGraphQLRequest } from '@/utils/helpers';
import type { MockServerConfig, RestPathString } from '@/utils/types';

import type { GraphqlRequestSuggestionConfigs, RestRequestSuggestionConfigs } from './helpers';
import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './helpers';

export const notFoundMiddleware = (
  server: Express,
  mockServerConfig: Pick<MockServerConfig, 'baseUrl' | 'rest' | 'graphql'>
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

  server.use((request, response) => {
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

    const isRequestSupportHtml =
      request.headers.accept?.includes('text/html') || request.headers.accept?.includes('*/*');
    if (isRequestSupportHtml) {
      response.status(404).render('pages/404', {
        restRequestSuggestions,
        graphqlRequestSuggestions
      });
      return;
    }

    response.status(404).json({
      message: 'Request or page not found. Similar requests in data',
      data: {
        restRequestSuggestions,
        graphqlRequestSuggestions
      }
    });
  });
};
