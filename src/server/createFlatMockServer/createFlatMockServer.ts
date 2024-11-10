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
  requestInterceptorMiddleware,
  staticMiddleware
} from '@/core/middlewares';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type {
  FlatMockServerComponent,
  FlatMockServerSettings,
  GraphQLRequestConfig,
  RestRequestConfig
} from '@/utils/types';

export const createFlatMockServer = (
  flatMockServerSettings: FlatMockServerSettings = {},
  flatMockServerComponents: FlatMockServerComponent[] = [],
  server: Express = express()
) => {
  const { cors, staticPath, interceptors, baseUrl: serverBaseUrl = '/' } = flatMockServerSettings;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  cookieParseMiddleware(server);

  const serverRequestInterceptor = interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware({ server, interceptor: serverRequestInterceptor });
  }

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, serverBaseUrl, staticPath);
  }

  flatMockServerComponents.forEach(({ configs = [], interceptors, baseUrl = '/', database }) => {
    const configRequestInterceptor = interceptors?.request;
    if (configRequestInterceptor) {
      requestInterceptorMiddleware({ server, interceptor: configRequestInterceptor });
    }

    const { rest, graphql } = configs.reduce(
      (acc, config) => {
        const isRest = 'method' in config;
        if (isRest) acc.rest.push(config);

        const isGraphql = 'operationType' in config;
        if (isGraphql) acc.graphql.push(config);

        return acc;
      },
      { rest: [] as RestRequestConfig[], graphql: [] as GraphQLRequestConfig[] }
    );

    if (rest.length) {
      const routerWithRestRoutes = createRestRoutes({
        router: express.Router(),
        restConfig: {
          baseUrl,
          configs: rest
        },
        serverResponseInterceptor: interceptors?.response
      });

      server.use(baseUrl, routerWithRestRoutes);
    }

    if (graphql.length) {
      const routerWithGraphQLRoutes = createGraphQLRoutes({
        router: express.Router(),
        graphqlConfig: {
          baseUrl,
          configs: graphql
        },
        serverResponseInterceptor: interceptors?.response
      });

      server.use(baseUrl, routerWithGraphQLRoutes);
    }

    if (database) {
      const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
      server.use(baseUrl, routerWithDatabaseRoutes);
    }

    notFoundMiddleware(server, {
      baseUrl: serverBaseUrl,
      rest: {
        baseUrl,
        configs: rest
      },
      graphql: {
        baseUrl,
        configs: graphql
      }
    });
  });

  errorMiddleware(server);

  return server;
};
