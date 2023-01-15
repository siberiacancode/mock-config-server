import bodyParser from 'body-parser';
import type { Express } from 'express';
import express from 'express';

import { corsMiddleware } from '../../cors/corsMiddleware/corsMiddleware';
import { noCorsMiddleware } from '../../cors/noCorsMiddleware/noCorsMiddleware';
import { createRoutes } from '../../routes/createRoutes/createRoutes';
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

  if (cors) {
    corsMiddleware(server, cors);
  } else {
    noCorsMiddleware(server);
  }

  if (staticPath) {
    staticMiddleware(server, baseUrl, staticPath);
  }

  const routerBase = express.Router();
  const routerWithRoutes = createRoutes(routerBase, {
    configs: mockServerConfig.configs,
    interceptors: mockServerConfig.interceptors
  });
  server.use(baseUrl, routerWithRoutes);

  return server;
};
