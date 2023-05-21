import type { IRouter } from 'express';

import { isPlainObject } from '@/utils/helpers';

import type { MemoryStorage } from '../../storages';

export const createShallowDatabase = (
  router: IRouter,
  shallowDatabase: Record<string, unknown>,
  storage: MemoryStorage
) => {
  Object.keys(shallowDatabase).forEach((key) => {
    router.route(key).get((_request, response) => {
      // ✅ important:
      // set 'Cache-Control' header for explicit browsers response revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.set('Cache-control', 'max-age=0, must-revalidate');
      response.json(storage.read(key));
    });

    router.route(key).post((request, response) => {
      // TODO add location header
      storage.write(key, request.body);
      response.json(request.body);
    });

    router.route(key).put((request, response) => {
      storage.write(key, request.body);
      response.json(request.body);
    });

    router.route(key).patch((request, response) => {
      const currentStorageResource = storage.read(key);
      
      if (!isPlainObject(currentStorageResource) || !isPlainObject(request.body)) {
        response.status(400).json({
          message: 'Cannot handle PATCH for non-object data or body',
          data: currentStorageResource,
          body: request.body
        });
        return;
      }

      const newStorageResource = { ...currentStorageResource, ...request.body };
      storage.write(key, newStorageResource);
      response.json(newStorageResource);
    });
  })
};
