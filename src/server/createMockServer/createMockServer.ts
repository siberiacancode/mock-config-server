import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { createDatabaseRoutes } from '@/core/database';
import { createGraphQLRoutes } from '@/core/graphql';
import {
  corsMiddleware,
  cookieParseMiddleware,
  noCorsMiddleware,
  notFoundMiddleware,
  requestInterceptorMiddleware,
  staticMiddleware,
  errorMiddleware
} from '@/core/middlewares';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig } from '@/utils/types';

export const createMockServer = (
  mockServerConfig: Omit<MockServerConfig, 'port'>,
  server: Express = express()
) => {
  const { cors, staticPath, rest, graphql, database, interceptors } = mockServerConfig;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  cookieParseMiddleware(server);

  const serverRequestInterceptor = mockServerConfig.interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware(server, serverRequestInterceptor);
  }

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
    const routerWithRestRoutes = createRestRoutes(express.Router(), rest, interceptors?.response);

    const apiRequestInterceptor = rest.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware(server, apiRequestInterceptor);
    }

    const restBaseUrl = urlJoin(baseUrl, rest.baseUrl ?? '/');

    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(
      express.Router(),
      graphql,
      interceptors?.response
    );

    const apiRequestInterceptor = graphql.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware(server, apiRequestInterceptor);
    }

    const graphqlBaseUrl = urlJoin(baseUrl, graphql.baseUrl ?? '/');

    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
    server.use(baseUrl, routerWithDatabaseRoutes);
  }

  notFoundMiddleware(server, mockServerConfig);

  errorMiddleware(server);

  return server;
};
