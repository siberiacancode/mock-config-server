import type { Request, Response } from 'express';
import { Express } from 'express';

import { parseGraphQLRequest } from '../graphql/parseGraphQLRequest/parseGraphQLRequest';
import { addBaseUrlsToUrl } from '../utils/helpers';
import type { BaseUrl, MockServerConfig, RestMethod } from '../utils/types';

import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './urlSuggestions';

interface NotFoundMiddlewareParams {
  server: Express;
  serverBaseUrl: BaseUrl;
  rest: MockServerConfig['rest'];
  graphql: MockServerConfig['graphql'];
}

export const notFoundMiddleware = ({
  server,
  serverBaseUrl,
  rest,
  graphql
}: NotFoundMiddlewareParams) => {
  const operationNames = graphql?.configs.map(({ operationName }) => operationName) ?? [];
  const graphqlPatternUrlMeaningfulStrings = Array.from(
    operationNames.reduce((acc, operationName) => {
      if (typeof operationName === 'string')
        acc.add(addBaseUrlsToUrl(operationName, serverBaseUrl, graphql?.baseUrl));
      return acc;
    }, new Set<string>())
  );

  const restPaths = rest?.configs.map(({ path }) => path) ?? [];
  const patternUrls = Array.from(
    restPaths.reduce((acc, patternPath) => {
      if (typeof patternPath === 'string')
        acc.add(addBaseUrlsToUrl(patternPath, serverBaseUrl, rest?.baseUrl));
      return acc;
    }, new Set<string>())
  );

  server.use((request: Request, response: Response) => {
    let graphqlUrlSuggestions: string[] = [];
    if (graphql) {
      const graphqlQuery = parseGraphQLRequest(request);

      if (graphqlQuery) {
        graphqlUrlSuggestions = getGraphqlUrlSuggestions({
          url: request.url,
          operationName: graphqlQuery.operationName,
          graphqlPatternUrlMeaningfulStrings
        });
      }
    }

    let restUrlSuggestions: string[] = [];
    if (rest) {
      restUrlSuggestions = getRestUrlSuggestions({
        // ✅ important: pass url with query params
        url: request.originalUrl,
        patternUrls
      });
    }

    response.status(404).render('notFound/notFound', {
      requestMethod: request.method as RestMethod,
      url: request.originalUrl,
      restUrlSuggestions,
      graphqlUrlSuggestions
    });
  });
};
