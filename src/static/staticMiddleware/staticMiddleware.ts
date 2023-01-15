import type { Express } from 'express';
import express from 'express';
import path from 'path';

import { APP_PATH } from '../../utils/constants';
import type { BaseUrl, StaticPath } from '../../utils/types';

export const staticMiddleware = (server: Express, baseUrl: BaseUrl, staticPath: StaticPath) => {
  const isStaticPathArray = Array.isArray(staticPath);

  if (isStaticPathArray) {
    staticPath.forEach((staticPath) => {
      const isPathObject = typeof staticPath === 'object';
      if (isPathObject) {
        return server.use(
          path.join(baseUrl, staticPath.prefix),
          express.static(path.join(APP_PATH, staticPath.path))
        );
      }
      server.use(baseUrl, express.static(path.join(APP_PATH, staticPath)));
    });

    return;
  }

  const isStaticPathObject = typeof staticPath === 'object';
  if (isStaticPathObject) {
    server.use(
      path.join(baseUrl, staticPath.prefix),
      express.static(path.join(APP_PATH, staticPath.path))
    );
    return;
  }

  server.use(baseUrl, express.static(path.join(APP_PATH, staticPath)));
};
