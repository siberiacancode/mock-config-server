import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { createGraphQLRoutes } from '@/core/graphql';
import {
  corsMiddleware,
  noCorsMiddleware,
  notFoundMiddleware,
  staticMiddleware
} from '@/core/middlewares';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig } from '@/utils/types';

export const createMockServer = (mockServerConfig: Omit<MockServerConfig, 'port'>) => {
  const { cors, staticPath, rest, graphql, interceptors } = mockServerConfig;
  const server: Express = express();

  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.set('view engine', 'ejs');
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
    const routerWithRestRoutes = createRestRoutes(express.Router(), rest, interceptors);

    const restBaseUrl = urlJoin(baseUrl, rest.baseUrl ?? '/');
    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(express.Router(), graphql, interceptors);

    const graphqlBaseUrl = urlJoin(baseUrl, graphql.baseUrl ?? '/');
    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  notFoundMiddleware({
    server,
    mockServerConfig
  });

  return server;
};
