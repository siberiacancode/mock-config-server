import type { IRouter } from 'express';

import type { DatabaseConfig, NestedDatabase, ShallowDatabase } from '@/utils/types';

import {
  createRewrittenDatabaseRoutes,
  splitDatabaseByNesting,
  createNestedDatabaseRoutes,
  createShallowDatabaseRoutes
} from './helpers';
import { FileStorage, MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, { data, routes }: DatabaseConfig) => {
  if (routes) {
    const isRoutesJsonFile = typeof routes === 'string';
    const storage = isRoutesJsonFile ? new FileStorage(routes) : new MemoryStorage(routes);
    createRewrittenDatabaseRoutes(router, storage.read());

    router.route('/__routes').get((_request, response) => {
      response.json(storage.read());
    });
  }

  const isDataJsonFile = typeof data === 'string';
  const storage = isDataJsonFile ? new FileStorage(data) : new MemoryStorage(data);
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(storage.read());
  createShallowDatabaseRoutes(router, shallowDatabase, storage as MemoryStorage<ShallowDatabase>);
  createNestedDatabaseRoutes(router, nestedDatabase, storage as MemoryStorage<NestedDatabase>);

  router.route('/__db').get((_request, response) => {
    response.json(storage.read());
  });

  return router;
};
