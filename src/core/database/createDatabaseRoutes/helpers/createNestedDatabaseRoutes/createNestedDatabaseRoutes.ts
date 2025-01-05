import type { IRouter } from 'express';
import type { ParsedUrlQuery } from 'node:querystring';

import { asyncHandler, callResponseInterceptors, isPlainObject } from '@/utils/helpers';
import type { Interceptors, NestedDatabase } from '@/utils/types';

import type { MemoryStorage } from '../../storages';
import { createNewId, findIndexById } from '../array';
import { filter } from '../filter/filter';
import { pagination } from '../pagination/pagination';
import { search } from '../search/search';
import { sort } from '../sort/sort';

interface CreateNestedDatabaseRoutesParams {
  router: IRouter;
  database: NestedDatabase;
  storage: MemoryStorage<NestedDatabase>;
  responseInterceptors?: {
    apiInterceptor?: Interceptors['response'];
    serverInterceptor?: Interceptors['response'];
  };
}

export const createNestedDatabaseRoutes = ({
  router,
  database,
  storage,
  responseInterceptors
}: CreateNestedDatabaseRoutesParams) => {
  Object.keys(database).forEach((key) => {
    const collectionPath = `/${key}`;
    const itemPath = `/${key}/:id`;

    router.route(collectionPath).get(
      asyncHandler(async (request, response) => {
        let data = storage.read(key);

        if (!Array.isArray(data) || !request.query) {
          // ✅ important:
          // set 'Cache-Control' header for explicit browsers response revalidate
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
          response.set('Cache-control', 'max-age=0, must-revalidate');
          return response.json(data);
        }

        const { _page, _limit, _begin, _end, _sort, _order, _q, ...filters } = request.query;

        if (Object.keys(filters).length) {
          data = filter(data, filters as ParsedUrlQuery);
        }

        if (_q) {
          data = search(data, request.query._q as ParsedUrlQuery);
        }

        if (_sort) {
          data = sort(data, request.query as ParsedUrlQuery);
        }

        if (_begin || _end) {
          data = data.slice(request.query._begin ?? 0, request.query._end);
          response.set('X-Total-Count', data.length);
        }

        // ✅ important:
        // The pagination should be last because it changes the form of the response
        if (_page) {
          data = pagination(data, request.query as ParsedUrlQuery);
          if (data._link) {
            const links = {} as any;
            const fullUrl = `${request.protocol}://${request.get('host')}${request.originalUrl}`;

            if (data._link.first) {
              links.first = fullUrl.replace(
                `page=${data._link.current}`,
                `page=${data._link.first}`
              );
            }
            if (data._link.prev) {
              links.prev = fullUrl.replace(`page=${data._link.current}`, `page=${data._link.prev}`);
            }
            if (data._link.next) {
              links.next = fullUrl.replace(`page=${data._link.current}`, `page=${data._link.next}`);
            }
            if (data._link.last) {
              links.last = fullUrl.replace(`page=${data._link.current}`, `page=${data._link.last}`);
            }

            data._link = { ...data._link, ...links };
            response.links(links);
          }
        }

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        response.set('Cache-control', 'no-cache');

        const updatedData = await callResponseInterceptors({
          data,
          request,
          response,
          interceptors: responseInterceptors
        });

        response.json(updatedData);
      })
    );

    router.route(collectionPath).post(
      asyncHandler(async (request, response) => {
        const collection = storage.read(key);
        const newResourceId = createNewId(collection);
        const newResource = { ...request.body, id: newResourceId };

        storage.write([key, collection.length], newResource);

        const updatedResource = await callResponseInterceptors({
          data: newResource,
          request,
          response,
          interceptors: responseInterceptors
        });

        if (isPlainObject(updatedResource) && typeof updatedResource.id === 'number') {
          response.set('Location', `${request.url}/${updatedResource.id}`);
          response.status(201).json(updatedResource);
          return;
        }
        response.status(400).end();
      })
    );

    router.route(itemPath).get(
      asyncHandler(async (request, response) => {
        const currentResourceCollection = storage.read(key);
        const currentResourceIndex = findIndexById(currentResourceCollection, request.params.id);
        if (currentResourceIndex === -1) {
          response.status(404).end();
          return;
        }

        // ✅ important:
        // set 'Cache-Control' header for explicit browsers response revalidate
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control
        response.set('Cache-control', 'no-cache');
        const updatedData = await callResponseInterceptors({
          data: storage.read([key, currentResourceIndex]),
          request,
          response,
          interceptors: responseInterceptors
        });
        response.json(updatedData);
      })
    );

    router.route(itemPath).put(
      asyncHandler(async (request, response) => {
        const currentResourceCollection = storage.read(key);
        const currentResourceIndex = findIndexById(currentResourceCollection, request.params.id);
        if (currentResourceIndex === -1) {
          response.status(404).end();
          return;
        }

        const currentResource = storage.read([key, currentResourceIndex]);
        const updatedResource = { ...request.body, id: currentResource.id };

        storage.write([key, currentResourceIndex], updatedResource);

        const updatedData = await callResponseInterceptors({
          data: updatedResource,
          request,
          response,
          interceptors: responseInterceptors
        });

        response.json(updatedData);
      })
    );

    router.route(itemPath).patch(
      asyncHandler(async (request, response) => {
        const currentResourceCollection = storage.read(key);
        const currentResourceIndex = findIndexById(currentResourceCollection, request.params.id);
        if (currentResourceIndex === -1) {
          response.status(404).end();
          return;
        }

        const currentResource = storage.read([key, currentResourceIndex]);
        const updatedResource = { ...currentResource, ...request.body, id: currentResource.id };

        storage.write([key, currentResourceIndex], updatedResource);

        const updatedData = await callResponseInterceptors({
          data: updatedResource,
          request,
          response,
          interceptors: responseInterceptors
        });

        response.json(updatedData);
      })
    );

    router.route(itemPath).delete(
      asyncHandler(async (request, response) => {
        const currentResourceCollection = storage.read(key);
        const currentResourceIndex = findIndexById(currentResourceCollection, request.params.id);
        if (currentResourceIndex === -1) {
          response.status(404).end();
          return;
        }

        storage.delete([key, currentResourceIndex]);

        await callResponseInterceptors({
          data: null,
          request,
          response,
          interceptors: responseInterceptors
        });

        response.status(204).end();
      })
    );
  });

  return router;
};
