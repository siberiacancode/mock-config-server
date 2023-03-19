import type { Express, Request, Response } from 'express';

import { parseGraphQLRequest } from '@/utils/helpers';
import type { MockServerConfig, RestMethod } from '@/utils/types';

import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './helpers';

interface NotFoundMiddlewareParams {
  server: Express;
  mockServerConfig: Pick<MockServerConfig, 'baseUrl' | 'rest' | 'graphql'>;
}

export const notFoundMiddleware = ({ server, mockServerConfig }: NotFoundMiddlewareParams) => {
  const { baseUrl: serverBaseUrl, rest, graphql } = mockServerConfig;

  const operationNames = graphql?.configs.map(({ operationName }) => operationName) ?? [];
  const graphqlPatternUrlMeaningfulStrings = Array.from(
    operationNames.reduce((acc, operationName) => {
      if (typeof operationName === 'string')
        acc.add(`${serverBaseUrl ?? ''}${graphql?.baseUrl ?? ''}/${operationName}`);
      return acc;
    }, new Set<string>())
  );

  const restPaths = rest?.configs.map(({ path }) => path) ?? [];
  const patternUrls = Array.from(
    restPaths.reduce((acc, patternPath) => {
      if (typeof patternPath === 'string')
        acc.add(`${serverBaseUrl ?? ''}${rest?.baseUrl ?? ''}${patternPath}`);
      return acc;
    }, new Set<string>())
  );

  server.use((request: Request, response: Response) => {
    const url = new URL(`${request.protocol}://${request.get('host')}${request.originalUrl}`);

    let graphqlUrlSuggestions: string[] = [];
    if (graphql) {
      const graphqlQuery = parseGraphQLRequest(request);

      if (graphqlQuery) {
        graphqlUrlSuggestions = getGraphqlUrlSuggestions({
          url,
          graphqlPatternUrlMeaningfulStrings
        });
      }
    }

    let restUrlSuggestions: string[] = [];
    if (rest) {
      restUrlSuggestions = getRestUrlSuggestions({
        url,
        patternUrls
      });
    }

    response.status(404).render('notFound', {
      requestMethod: request.method as RestMethod,
      url: `${url.pathname}${url.search}`,
      restUrlSuggestions,
      graphqlUrlSuggestions
    });
  });
};
