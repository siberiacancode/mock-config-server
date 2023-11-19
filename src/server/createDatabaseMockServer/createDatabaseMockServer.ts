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
  requestInfoMiddleware,
  requestInterceptorMiddleware,
  staticMiddleware
} from '@/core/middlewares';
import { urlJoin } from '@/utils/helpers';
import type { DatabaseMockServerConfig } from '@/utils/types';

export const createDatabaseMockServer = (
  databaseMockServerConfig: Omit<DatabaseMockServerConfig, 'port'>,
  server: Express = express()
) => {
  const { cors, staticPath, data, routes } = databaseMockServerConfig;

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../static/views')));

  server.use(bodyParser.urlencoded({ extended: false }));

  server.use(bodyParser.json({ limit: '10mb' }));
  server.set('json spaces', 2);

  server.use(bodyParser.text());

  requestInfoMiddleware(server);

  cookieParseMiddleware(server);

  const serverRequestInterceptor = databaseMockServerConfig.interceptors?.request;
  if (serverRequestInterceptor) {
    requestInterceptorMiddleware(server, serverRequestInterceptor);
  }

  const baseUrl = databaseMockServerConfig.baseUrl ?? '/';

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }

  const routerWithDatabaseRoutes = createDatabaseRoutes(express.Router(), { data, routes });
  server.use(baseUrl, routerWithDatabaseRoutes);

  notFoundMiddleware(server, databaseMockServerConfig);

  errorMiddleware(server);

  return server;
};
