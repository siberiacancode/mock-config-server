import type { IRouter } from 'express';

import type { DatabaseConfig } from '@/utils/types';

import { splitDatabaseByNesting, createNestedDatabase, createShallowDatabase } from './helpers';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, databaseConfig: DatabaseConfig) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);

  createShallowDatabase(router, shallowDatabase, new MemoryStorage(shallowDatabase));
  createNestedDatabase(router, nestedDatabase, new MemoryStorage(nestedDatabase));

  return router;
};
