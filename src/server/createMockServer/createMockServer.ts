import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { createDatabaseRoutes } from '@/core/database';
import { createGraphQLRoutes } from '@/core/graphql';
import {
  cookieParseMiddleware,
  corsMiddleware,
  errorMiddleware,
  noCorsMiddleware,
  notFoundMiddleware,
  requestInfoMiddleware,
  requestInterceptorMiddleware,
  staticMiddleware
} from '@/core/middlewares';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig } from '@/utils/types';

export const createMockServer = (
  mockServerConfig: Omit<MockServerConfig, 'port'>,
  server: Express = express()
) => {
  const { cors, staticPath, rest, graphql, database, interceptors, loggers } = mockServerConfig;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  requestInfoMiddleware(server);

  cookieParseMiddleware(server);

  const serverRequestInterceptor = mockServerConfig.interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware(server, serverRequestInterceptor);
  }

  // const serverRequestLoggers = mockServerConfig.loggers;
  // if (serverRequestLoggers?.request) {
  //   requestLoggerMiddleware(server, serverRequestLoggers.request);
  // }

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
    const routerWithRestRoutes = createRestRoutes({
      router: express.Router(),
      restConfig: rest,
      serverResponseInterceptor: interceptors?.response,
      apiLoggers: rest.loggers,
      serverLoggers: loggers
    });

    const restBaseUrl = urlJoin(baseUrl, rest.baseUrl ?? '/');

    const apiRequestInterceptor = rest.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware(server, apiRequestInterceptor, restBaseUrl);
    }

    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes({
      router: express.Router(),
      graphqlConfig: graphql,
      serverResponseInterceptor: interceptors?.response,
      apiLoggers: graphql.loggers,
      serverLoggers: loggers
    });

    const graphqlBaseUrl = urlJoin(baseUrl, graphql.baseUrl ?? '/');

    const apiRequestInterceptor = graphql.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware(server, apiRequestInterceptor, graphqlBaseUrl);
    }

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
