import type { IRouter } from 'express';

import { isPlainObject } from '@/utils/helpers';
import type { ShallowDatabase } from '@/utils/types';

import type { MemoryStorage } from '../../storages';

export const createShallowDatabaseRoutes = (
  router: IRouter,
  shallowDatabase: ShallowDatabase,
  storage: MemoryStorage<ShallowDatabase>
) => {
  Object.keys(shallowDatabase).forEach((key) => {
    router.route(`/${key}`).get((_request, response) => {
      // ✅ important:
      // set 'Cache-Control' header for explicit browsers response revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.set('Cache-control', 'max-age=0, must-revalidate');
      response.json(storage.read(key));
    });

    router.route(`/${key}`).post((request, response) => {
      storage.write(key, request.body);
      response.set('Location', request.url);
      response.status(201).json(request.body);
    });

    router.route(`/${key}`).put((request, response) => {
      storage.write(key, request.body);
      response.json(request.body);
    });

    router.route(`/${key}`).patch((request, response) => {
      const currentResource = storage.read(key);

      if (!isPlainObject(currentResource) || !isPlainObject(request.body)) {
        response.status(400).json({
          message: 'Cannot handle PATCH for non-object data or body',
          data: currentResource,
          body: request.body
        });
        return;
      }

      const newResource = { ...currentResource, ...request.body };
      storage.write(key, newResource);
      response.json(newResource);
    });
  });

  return router;
};
