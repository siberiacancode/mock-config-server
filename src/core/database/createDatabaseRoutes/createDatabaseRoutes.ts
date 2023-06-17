import type { IRouter } from 'express';

import type { DatabaseConfig, NestedDatabase, ShallowDatabase } from '@/utils/types';

import {
  splitDatabaseByNesting,
  createNestedDatabaseRoutes,
  createShallowDatabaseRoutes
} from './helpers';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, databaseConfig: DatabaseConfig) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);

  const storage = new MemoryStorage(databaseConfig);
  createShallowDatabaseRoutes(router, shallowDatabase, storage as MemoryStorage<ShallowDatabase>);
  createNestedDatabaseRoutes(router, nestedDatabase, storage as MemoryStorage<NestedDatabase>);

  // ✅ important:
  // add endpoint for all database
  router.route('/__db').get((_request, response) => {
    response.json(storage.read());
  });

  return router;
};
