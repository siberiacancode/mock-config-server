import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { corsMiddleware } from '../../cors/corsMiddleware/corsMiddleware';
import { noCorsMiddleware } from '../../cors/noCorsMiddleware/noCorsMiddleware';
import { createGraphQLRoutes } from '../../graphql/createGraphQLRoutes/createGraphQLRoutes';
import { notFoundMiddleware } from '../../notFound/notFoundMiddleware';
import { createRestRoutes } from '../../rest/createRestRoutes/createRestRoutes';
import { staticMiddleware } from '../../static/staticMiddleware/staticMiddleware';
import { urlJoin } from '../../utils/helpers';
import type { MockServerConfig } from '../../utils/types';

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
    const routerWithRestRoutes = createRestRoutes(express.Router(), rest.configs, interceptors);

    const restBaseUrl = urlJoin(baseUrl, rest.baseUrl ?? '/');
    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(
      express.Router(),
      graphql.configs,
      interceptors
    );

    const graphqlBaseUrl = urlJoin(baseUrl, graphql.baseUrl ?? '/');
    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  notFoundMiddleware({
    server,
    mockServerConfig
  });

  return server;
};
