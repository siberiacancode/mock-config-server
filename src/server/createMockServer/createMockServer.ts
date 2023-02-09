import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';
import path from 'path';

import { corsMiddleware } from '../../cors/corsMiddleware/corsMiddleware';
import { noCorsMiddleware } from '../../cors/noCorsMiddleware/noCorsMiddleware';
import { createGraphQLRoutes } from '../../graphql/createGraphQLRoutes/createGraphQLRoutes';
import { notFoundMiddleware } from '../../notFoundPage/notFoundMiddleware';
import { createRestRoutes } from '../../rest/createRestRoutes/createRestRoutes';
import { staticMiddleware } from '../../static/staticMiddleware/staticMiddleware';
import type { MockServerConfig } from '../../utils/types';

export const createMockServer = ({
  cors,
  staticPath,
  rest,
  graphql,
  interceptors,
  pathSuggestions,
  ...mockServerConfig
}: Omit<MockServerConfig, 'port'>) => {
  const server: Express = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json({ limit: '10mb' }));

  const baseUrl = mockServerConfig.baseUrl ?? '/';

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }
  if (rest) {
    const routerWithRestRoutes = createRestRoutes(express.Router(), rest.configs, interceptors);

    const restBaseUrl = path.join(baseUrl, rest.baseUrl ?? '/');
    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(
      express.Router(),
      graphql.configs,
      interceptors
    );

    const graphqlBaseUrl = path.join(baseUrl, graphql.baseUrl ?? '/');
    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  notFoundMiddleware({
    server,
    serverBaseUrl: baseUrl,
    rest,
    graphql,
    pathSuggestions
  });

  return server;
};
