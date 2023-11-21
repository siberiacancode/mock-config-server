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
  requestLoggerMiddleware,
  responseInterceptorsMiddleware,
  responseLoggersMiddleware,
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

    const apiRequestLogger = rest.loggers?.request;
    if (apiRequestLogger) {
      requestLoggerMiddleware(server, apiRequestLogger, 'api', restBaseUrl);
    }
    const serverRequestLogger = loggers?.request;
    if (serverRequestLogger) {
      requestLoggerMiddleware(server, serverRequestLogger, 'server', restBaseUrl);
    }

    const serverResponseInterceptor = mockServerConfig.interceptors?.response;
    const restResponseInterceptor = rest.interceptors?.response;
    if (serverResponseInterceptor || restResponseInterceptor) {
      responseInterceptorsMiddleware({
        server,
        interceptors: {
          serverInterceptor: serverResponseInterceptor,
          apiInterceptor: restResponseInterceptor
        },
        path: restBaseUrl
      });
    }

    const serverResponseLogger = mockServerConfig.loggers?.response;
    const restResponseLogger = rest.loggers?.response;
    if (serverResponseLogger || restResponseLogger) {
      responseLoggersMiddleware({
        server,
        loggers: {
          serverLogger: serverResponseLogger,
          apiLogger: restResponseLogger
        },
        path: restBaseUrl
      });
    }
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

    const apiRequestLogger = graphql.loggers?.request;
    if (apiRequestLogger) {
      requestLoggerMiddleware(server, apiRequestLogger, 'api', graphqlBaseUrl);
    }
    const serverRequestLogger = loggers?.request;
    if (serverRequestLogger) {
      requestLoggerMiddleware(server, serverRequestLogger, 'server', graphqlBaseUrl);
    }

    const serverResponseInterceptor = mockServerConfig.interceptors?.response;
    const graphqlResponseInterceptor = graphql.interceptors?.response;
    if (serverResponseInterceptor || graphqlResponseInterceptor) {
      responseInterceptorsMiddleware({
        server,
        interceptors: {
          serverInterceptor: serverResponseInterceptor,
          apiInterceptor: graphqlResponseInterceptor
        },
        path: graphqlBaseUrl
      });
    }

    const serverResponseLogger = mockServerConfig.loggers?.response;
    const graphqlResponseLogger = graphql.loggers?.response;
    if (serverResponseLogger || graphqlResponseLogger) {
      responseLoggersMiddleware({
        server,
        loggers: {
          serverLogger: serverResponseLogger,
          apiLogger: graphqlResponseLogger
        },
        path: graphqlBaseUrl
      });
    }
  }

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
    server.use(baseUrl, routerWithDatabaseRoutes);
  }

  notFoundMiddleware(server, mockServerConfig);

  errorMiddleware(server);

  return server;
};
