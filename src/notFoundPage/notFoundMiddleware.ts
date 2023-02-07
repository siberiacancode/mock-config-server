import type { Request, Response } from 'express';
import { Express } from 'express';

import { parseGraphQLRequest } from '../graphql/parseGraphQLRequest/parseGraphQLRequest';
import type { MockServerConfig } from '../utils/types';

import { getGraphqlUrlSuggestions, getRestUrlSuggestions } from './urlSuggestions';

export const notFoundMiddleware = (server: Express, mockServerConfig: MockServerConfig) => {
  server.use((request: Request, response: Response) => {
    const { baseUrl, rest, graphql, pathSuggestions } = mockServerConfig;

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
          serverBaseUrl: baseUrl,
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
        serverBaseUrl: baseUrl,
        restBaseUrl: rest.baseUrl,
        typoTolerance: pathSuggestions?.typoTolerance
      });
    }

    response.status(404).send(`
        <h1>404</h1>
        <div>Seems to be your config does not have data for '${request.method} ${decodeURIComponent(
      request.originalUrl
    )} request, or you have typo in it.</div>
        
        ${
          restUrlSuggestions.length || graphqlUrlSuggestions.length
            ? `
          <h2>Maybe you are looking for one of these paths?</h2>
          `
            : ''
        }
        ${
          restUrlSuggestions.length
            ? `
      <div>
        <h3>REST</h3>
        <ul>
          ${restUrlSuggestions
            .map(
              (restUrlSuggestion) =>
                `<li><a href=${restUrlSuggestion}>${decodeURIComponent(restUrlSuggestion)}</a></li>`
            )
            .join('')}
        </ul>
      </div>
    `
            : ''
        }
        
        ${
          graphqlUrlSuggestions.length
            ? `
      <div>
        <h3>GraphQL</h3>
        <ul>
          ${graphqlUrlSuggestions
            .map((graphqlUrlSuggestion) => `<li>${decodeURIComponent(graphqlUrlSuggestion)}</li>`)
            .join('')}
        </ul>
      </div>
    `
            : ''
        }
    `);
  });
};
