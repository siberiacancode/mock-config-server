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
  FlatMockServerConfig,
  FlatMockServerSettings,
  GraphQLRequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  RestRequestConfig
} from '@/utils/types';

export const createFlatMockServer = (
  flatMockServerConfig: FlatMockServerConfig = [{}],
  server: Express = express()
) => {
  const [option, ...flatMockServerComponents] = flatMockServerConfig;

  const flatMockServerSettings = !('config' in option)
    ? (option as FlatMockServerSettings)
    : undefined;
  const {
    cors,
    staticPath,
    interceptors,
    baseUrl: serverBaseUrl = '/',
    database
  } = flatMockServerSettings ?? {};

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

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
    server.use(serverBaseUrl, routerWithDatabaseRoutes);
  }

  const { restRequestConfigs, graphQLRequestConfigs } = flatMockServerComponents.reduce(
    (acc, component) => {
      const { baseUrl = '' } = component;

      component.configs.forEach((config) => {
        const interceptors = {
          ...((component.interceptors?.request || config.interceptors?.request) && {
            interceptors: {
              ...(component.interceptors?.request && {
                request: ((...params) => {
                  if (component.interceptors?.request) {
                    component.interceptors.request(...params);
                  }
                  if (config.interceptors?.request) {
                    config.interceptors.request(...params);
                  }
                }) as RequestInterceptor
              }),
              ...(component.interceptors?.response && {
                response: ((...params) => {
                  if (component.interceptors?.response) {
                    component.interceptors.response(...params);
                  }
                  if (config.interceptors?.response) {
                    config.interceptors.response(...params);
                  }
                }) as ResponseInterceptor
              })
            }
          })
        };

        const isRest = 'method' in config;
        if (isRest)
          acc.restRequestConfigs.push({
            ...config,
            ...interceptors,
            path:
              config.path instanceof RegExp
                ? new RegExp(`${baseUrl}${config.path}`)
                : `${baseUrl}${config.path}`
          });

        const isGraphql = 'operationType' in config;
        if (isGraphql)
          acc.graphQLRequestConfigs.push({
            ...config,
            ...interceptors
          });
      });

      return acc;
    },
    {
      restRequestConfigs: [] as RestRequestConfig[],
      graphQLRequestConfigs: [] as GraphQLRequestConfig[]
    }
  );

  if (restRequestConfigs.length) {
    const routerWithRestRoutes = createRestRoutes({
      router: express.Router(),
      restConfig: {
        configs: restRequestConfigs
      },
      serverResponseInterceptor: interceptors?.response
    });

    server.use(serverBaseUrl, routerWithRestRoutes);
  }

  if (graphQLRequestConfigs.length) {
    const routerWithGraphQLRoutes = createGraphQLRoutes({
      router: express.Router(),
      graphqlConfig: {
        configs: graphQLRequestConfigs
      },
      serverResponseInterceptor: interceptors?.response
    });

    server.use(serverBaseUrl, routerWithGraphQLRoutes);
  }

  notFoundMiddleware(server, {
    baseUrl: flatMockServerSettings?.baseUrl,
    rest: {
      configs: restRequestConfigs
    },
    graphql: {
      configs: graphQLRequestConfigs
    }
  });

  errorMiddleware(server);

  return server;
};
