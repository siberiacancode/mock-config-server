import type { Request, Response } from 'express';
import { Express } from 'express';

import { parseGraphQLRequest } from '../graphql/parseGraphQLRequest/parseGraphQLRequest';
import type { BaseUrl, MockServerConfig, RestMethod } from '../utils/types';

import { getNotFoundPage } from './getNotFoundPage';
import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './urlSuggestions';

interface NotFoundMiddlewareParams {
  server: Express;
  serverBaseUrl: BaseUrl;
  rest: MockServerConfig['rest'];
  graphql: MockServerConfig['graphql'];
  pathSuggestions: MockServerConfig['pathSuggestions'];
}

export const notFoundMiddleware = ({
  server,
  serverBaseUrl,
  rest,
  graphql,
  pathSuggestions
}: NotFoundMiddlewareParams) => {
  server.use((request: Request, response: Response) => {
    let graphqlUrlSuggestions: string[] = [];
    if (graphql) {
      const graphqlQuery = parseGraphQLRequest(request);

      if (graphqlQuery)
        graphqlUrlSuggestions = getGraphqlUrlSuggestions({
          query: {
            url: request.url,
            operationName: graphqlQuery.operationName
          },
          patternOperationNames: graphql.configs.map(({ operationName }) => operationName),
          serverBaseUrl,
          graphqlBaseUrl: graphql.baseUrl,
          typoTolerance: pathSuggestions?.typoTolerance
        });
    }

    let restUrlSuggestions: string[] = [];
    if (rest) {
      restUrlSuggestions = getRestUrlSuggestions({
        // ✅ important: pass url with query params
        url: request.originalUrl,
        patternPaths: rest.configs.map(({ path }) => path),
        serverBaseUrl,
        restBaseUrl: rest.baseUrl,
        typoTolerance: pathSuggestions?.typoTolerance
      });
    }

    response.status(404).send(
      getNotFoundPage({
        requestMethod: request.method as RestMethod,
        url: request.originalUrl,
        restUrlSuggestions,
        graphqlUrlSuggestions
      })
    );
  });
};
