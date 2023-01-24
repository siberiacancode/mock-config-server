import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';
import path from 'path';

import { corsMiddleware } from '../../cors/corsMiddleware/corsMiddleware';
import { noCorsMiddleware } from '../../cors/noCorsMiddleware/noCorsMiddleware';
import { createGraphQLRoutes } from '../../graphql/createGraphQLRoutes/createGraphQLRoutes';
import { createRestRoutes } from '../../rest/createRestRoutes/createRestRoutes';
import { staticMiddleware } from '../../static/staticMiddleware/staticMiddleware';
import type { MockServerConfig } from '../../utils/types';

export const createMockServer = ({
  cors,
  staticPath,
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

  const routerBase = express.Router();

  if (mockServerConfig.rest) {
    const routerWithRestRoutes = createRestRoutes(
      routerBase,
      mockServerConfig.rest.configs,
      mockServerConfig.interceptors
    );
    const restBaseUrl = path.join(baseUrl, mockServerConfig.rest.baseUrl ?? '/');
    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (mockServerConfig.graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(
      routerBase,
      mockServerConfig.graphql.configs,
      mockServerConfig.interceptors
    );

    const graphqlBaseUrl = path.join(baseUrl, mockServerConfig.graphql.baseUrl ?? '/');
    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  return server;
};
