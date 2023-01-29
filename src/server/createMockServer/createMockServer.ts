import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';
import path from 'path';

import { corsMiddleware } from '../../cors/corsMiddleware/corsMiddleware';
import { noCorsMiddleware } from '../../cors/noCorsMiddleware/noCorsMiddleware';
import { notFoundMiddleware, requestLoggerMiddleware } from '../../middlewares';
import { createGraphQLRoutes } from '../../graphql/createGraphQLRoutes/createGraphQLRoutes';
import { createRestRoutes } from '../../rest/createRestRoutes/createRestRoutes';
import { staticMiddleware } from '../../static/staticMiddleware/staticMiddleware';
import type { MockServerConfig } from '../../utils/types';

export const createMockServer = ({
  cors,
  staticPath,
  ...mockServerConfig
}: Omit<MockServerConfig, 'port'>) => {
  const server: Express = express();

  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json({ limit: '10mb' }));

  const baseUrl = mockServerConfig.baseUrl ?? '/';
  const configPaths = mockServerConfig.configs.map((config) => config.path);

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }

  server.use(
    requestLoggerMiddleware({
      logger: console.log,
      logHeaders: false,
      logQuery: true
    })
  );

  server.get('/', (_, res) => {
    res.send(`
    <h1>🎉Welcome to mock-config-server!🎉</h1>
    <div>
      <h2>Your config have the following paths:</h2>
      <ul>
        ${configPaths.map((path) => `<li><a href=${path}>${path}</a></li>`).join('')}
      </ul>
    </div>
    `);
  });

  const routerBase = express.Router();

  if (mockServerConfig.rest) {
    const routerWithRestRoutes = createRestRoutes(
      routerBase,
      mockServerConfig.rest.configs,
      mockServerConfig.interceptors
    );
    const restBaseUrl = path.join(baseUrl, mockServerConfig.rest.baseUrl ?? '/');
    server.use(restBaseUrl, routerWithRestRoutes);
  }

  if (mockServerConfig.graphql) {
    const routerWithGraphQLRoutes = createGraphQLRoutes(
      routerBase,
      mockServerConfig.graphql.configs,
      mockServerConfig.interceptors
    );

    const graphqlBaseUrl = path.join(baseUrl, mockServerConfig.graphql.baseUrl ?? '/');
    server.use(graphqlBaseUrl, routerWithGraphQLRoutes);
  }

  // TODO: add RegExp support for typo checking
  server.use(
    notFoundMiddleware(
      configPaths.filter((configPath): configPath is string => typeof configPath === 'string')
    )
  );

  return server;
};
