import type { IRouter } from 'express';

import type { DatabaseConfig } from '@/utils/types';

import {
  splitDatabaseByNesting,
  createNestedDatabaseRoutes,
  createShallowDatabaseRoutes
} from './helpers';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, databaseConfig: DatabaseConfig) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);

  createShallowDatabaseRoutes(router, shallowDatabase, new MemoryStorage(shallowDatabase));
  createNestedDatabaseRoutes(router, nestedDatabase, new MemoryStorage(nestedDatabase));

  return router;
};
