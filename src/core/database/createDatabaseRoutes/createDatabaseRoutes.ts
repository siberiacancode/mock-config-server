import type { IRouter } from 'express';

import type { DatabaseConfig } from '@/utils/types';

import { splitDatabaseByNesting } from './helpers';
import { createShallowDatabase } from './helpers/createShallowDatabase/createShallowDatabase';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (
  router: IRouter,
  databaseConfig: DatabaseConfig
) => {
  const memoryStorage = new MemoryStorage(databaseConfig);
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);
  
  createShallowDatabase(router, shallowDatabase, memoryStorage);
  // createNestedDatabase(router, nestedDatabase, memoryStorage);

  return router;
};
