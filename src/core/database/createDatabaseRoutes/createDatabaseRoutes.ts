import type { IRouter } from 'express';

import type { DatabaseConfig } from '@/utils/types';

import { splitDatabaseByNesting } from './helpers';
import { createNestedDatabase } from './helpers/createNestedDatabase/createNestedDatabase';
import { createShallowDatabase } from './helpers/createShallowDatabase/createShallowDatabase';
import { MemoryStorage } from './storages';

export const createDatabaseRoutes = (router: IRouter, databaseConfig: DatabaseConfig) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);

  createShallowDatabase(router, shallowDatabase, new MemoryStorage(shallowDatabase));
  createNestedDatabase(router, nestedDatabase, new MemoryStorage(nestedDatabase));

  return router;
};
