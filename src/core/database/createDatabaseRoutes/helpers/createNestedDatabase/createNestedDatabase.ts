import type { IRouter } from 'express';

import { isPlainObject } from '@/utils/helpers';

import type { MemoryStorage } from '../../storages';

export const createNestedDatabase = (
  router: IRouter,
  nestedDatabase: Record<string, Record<string, unknown>[]>,
  storage: MemoryStorage<typeof nestedDatabase>
) => {
  Object.keys(nestedDatabase).forEach((key) => {
    router.route(`/${key}`).get((_request, response) => {
      // ✅ important:
      // set 'Cache-Control' header for explicit browsers response revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.set('Cache-control', 'max-age=0, must-revalidate');
      response.json(storage.read(key));
    });

    router.route(`/${key}`).post((request, response) => {
      if (!isPlainObject(request.body)) {
        response.status(400).json({
          message: 'Cannot handle POST for non-object body',
          body: request.body
        });
        return;
      }

      // TODO create normal id
      const resourceLastIndex = storage.read(key).length - 1;
      const newResource = { ...request.body, id: resourceLastIndex };
      storage.write([key, resourceLastIndex + 1], newResource);
      response.status(201).json(newResource);
    });

    router.route(`/${key}/:id`).get((request, response) => {
      // ✅ important:
      // set 'Cache-Control' header for explicit browsers response revalidate
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
      response.set('Cache-control', 'max-age=0, must-revalidate');
      response.json(storage.read([key, request.params.id]));
    });

    router.route(`/${key}/:id`).put((request, response) => {
      const currentResource = storage.read([key, request.params.id]);

      if (!isPlainObject(currentResource) || !isPlainObject(request.body)) {
        response.status(400).json({
          message: 'Cannot handle PUT for non-object resource or body',
          resource: currentResource,
          body: request.body
        });
        return;
      }

      const currentResourceIndex = storage
        .read(key)
        .findIndex((resource) => resource.id === request.params.id);
      const newResource = { ...request.body, id: currentResource.id };
      storage.write([key, currentResourceIndex], newResource);
      response.json(newResource);
    });

    router.route(`/${key}/:id`).patch((request, response) => {
      const currentResource = storage.read([key, request.params.id]);

      if (!isPlainObject(currentResource) || !isPlainObject(request.body)) {
        response.status(400).json({
          message: 'Cannot handle PATCH for non-object resource or body',
          resource: currentResource,
          body: request.body
        });
        return;
      }

      const currentResourceIndex = storage
        .read(key)
        .findIndex((resource) => resource.id === request.params.id);
      const newResource = { ...currentResource, ...request.body, id: currentResource.id };
      storage.write([key, currentResourceIndex], newResource);
      response.json(newResource);
    });

    router.route(`/${key}/:id`).delete((request, response) => {
      const currentResourceArray = storage.read(key);
      const currentResourceIndex = currentResourceArray.findIndex(
        (resource) => resource.id === request.params.id
      );
      currentResourceArray.splice(currentResourceIndex, 1);
      response.status(204).send();
    });
  });
};
