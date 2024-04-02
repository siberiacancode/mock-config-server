import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { createDatabaseRoutes } from '@/core/database';
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
import type { RestMockServerConfig } from '@/utils/types';

export const createRestMockServer = (
  restMockServerConfig: Omit<RestMockServerConfig, 'port'>,
  server: Express = express()
) => {
  const { cors, staticPath, configs, database, interceptors } = restMockServerConfig;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  cookieParseMiddleware(server);

  const serverRequestInterceptor = restMockServerConfig.interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware({ server, interceptor: serverRequestInterceptor });
  }

  const baseUrl = restMockServerConfig.baseUrl ?? '/';

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }

  const routerWithRestRoutes = createRestRoutes({
    router: express.Router(),
    restConfig: { configs: configs ?? [] },
    serverResponseInterceptor: interceptors?.response
  });

  server.use(baseUrl, routerWithRestRoutes);

  if (database) {
    const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), database);
    server.use(baseUrl, routerWithDatabaseRoutes);
  }

  notFoundMiddleware(server, restMockServerConfig);

  errorMiddleware(server);

  return server;
};
