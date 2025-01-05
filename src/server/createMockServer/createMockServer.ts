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

  contextMiddleware(server);

  cookieParseMiddleware(server);

  const serverRequestInterceptor = interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware({ server, interceptor: serverRequestInterceptor });
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
    const routerWithRestRoutes = createRestRoutes({
      router: express.Router(),
      restConfig: rest,
      serverResponseInterceptor: interceptors?.response
    });

    const restBaseUrl = urlJoin(baseUrl, rest.baseUrl ?? '/');

    const apiRequestInterceptor = rest.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware({
        server,
        path: restBaseUrl,
        interceptor: apiRequestInterceptor
      });
    }

    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes({
      router: express.Router(),
      graphqlConfig: graphql,
      serverResponseInterceptor: interceptors?.response
    });

    const graphqlBaseUrl = urlJoin(baseUrl, graphql.baseUrl ?? '/');

    const apiRequestInterceptor = graphql.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware({
        server,
        path: graphqlBaseUrl,
        interceptor: apiRequestInterceptor
      });
    }

    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes({
      router: express.Router(),
      databaseConfig: database,
      serverResponseInterceptor: interceptors?.response
    });

    const databaseBaseUrl = urlJoin(baseUrl, database.baseUrl ?? '/');

    const apiRequestInterceptor = database.interceptors?.request;
    if (apiRequestInterceptor) {
      requestInterceptorMiddleware({
        server,
        path: databaseBaseUrl,
        interceptor: apiRequestInterceptor
      });
    }

    server.use(databaseBaseUrl, routerWithDatabaseRoutes);
  }

  notFoundMiddleware(server, mockServerConfig);

  errorMiddleware(server);

  return server;
};
