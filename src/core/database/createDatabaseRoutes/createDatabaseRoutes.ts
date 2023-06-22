import type { IRouter } from 'express';

import type { DatabaseConfig, NestedDatabase, ShallowDatabase } from '@/utils/types';

import {
  createRewrittenDatabaseRoutes,
  splitDatabaseByNesting,
  createNestedDatabaseRoutes,
  createShallowDatabaseRoutes
} from './helpers';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, databaseConfig: DatabaseConfig) => {
  if (databaseConfig.routes) createRewrittenDatabaseRoutes(router, databaseConfig.routes);

  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig.data);
  const storage = new MemoryStorage(databaseConfig.data);
  createShallowDatabaseRoutes(router, shallowDatabase, storage as MemoryStorage<ShallowDatabase>);
  createNestedDatabaseRoutes(router, nestedDatabase, storage as MemoryStorage<NestedDatabase>);

  // ✅ important:
  // add endpoint for all database
  router.route('/__db').get((_request, response) => {
    response.json(storage.read());
  });

  return router;
};
