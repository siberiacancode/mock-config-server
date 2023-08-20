import type { IRouter } from 'express';

import type { ShallowDatabase } from '@/utils/types';

import type { MemoryStorage } from '../../storages';

export const createShallowDatabaseRoutes = (
  router: IRouter,
  database: ShallowDatabase,
  storage: MemoryStorage<ShallowDatabase>
) => {
  Object.keys(database).forEach((key) => {
    const path = `/${key}`;

    router.route(path).get((_request, response) => {
      // ✅ important:
      // set 'Cache-Control' header for explicit browsers response revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.set('Cache-control', 'max-age=0, must-revalidate');
      response.json(storage.read(key));
    });

    router.route(path).post((request, response) => {
      storage.write(key, request.body);
      response.set('Location', request.url);
      response.status(201).json(request.body);
    });

    router.route(path).put((request, response) => {
      storage.write(key, request.body);
      response.json(request.body);
    });

    router.route(path).patch((request, response) => {
      const currentResource = storage.read(key);
      const updatedResource = { ...currentResource, ...request.body };
      storage.write(key, updatedResource);
      response.json(updatedResource);
    });
  });

  return router;
};
