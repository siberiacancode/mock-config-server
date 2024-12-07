import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { createDatabaseRoutes } from '@/core/database';
import { createGraphQLRoutes } from '@/core/graphql';
import {
  contextMiddleware,
  cookieParseMiddleware,
  corsMiddleware,
  errorMiddleware,
  noCorsMiddleware,
  notFoundMiddleware,
  requestInterceptorMiddleware,
  staticMiddleware
} from '@/core/middlewares';
import { urlJoin } from '@/utils/helpers';
import type { GraphQLMockServerConfig } from '@/utils/types';

export const createGraphQLMockServer = (
  graphqlMockServerConfig: Omit<GraphQLMockServerConfig, 'port'>,
  server: Express = express()
) => {
  const { cors, staticPath, configs, database, interceptors } = graphqlMockServerConfig;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  contextMiddleware(server, graphqlMockServerConfig);
  cookieParseMiddleware(server);

  const serverRequestInterceptor = graphqlMockServerConfig.interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware({ server, interceptor: serverRequestInterceptor });
  }

  const baseUrl = graphqlMockServerConfig.baseUrl ?? '/';

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }

  const routerWithGraphqlRoutes = createGraphQLRoutes({
    router: express.Router(),
    graphqlConfig: { configs: configs ?? [] },
    serverResponseInterceptor: interceptors?.response
  });

  server.use(baseUrl, routerWithGraphqlRoutes);

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
    server.use(baseUrl, routerWithDatabaseRoutes);
  }

  notFoundMiddleware(server, graphqlMockServerConfig);

  errorMiddleware(server);

  return server;
};
