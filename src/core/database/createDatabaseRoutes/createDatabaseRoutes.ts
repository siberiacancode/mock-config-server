import type { IRouter } from 'express';

import type { DatabaseConfig, Interceptors, NestedDatabase, ShallowDatabase } from '@/utils/types';

import {
  createNestedDatabaseRoutes,
  createRewrittenDatabaseRoutes,
  createShallowDatabaseRoutes,
  splitDatabaseByNesting
} from './helpers';
import { FileStorage, MemoryStorage } from './storages';

const isVariableJsonFile = (variable: unknown): variable is `${string}.json` =>
  typeof variable === 'string' && variable.endsWith('.json');

interface CreateDatabaseRoutesParams {
  router: IRouter;
  databaseConfig: DatabaseConfig;
  serverResponseInterceptor?: Interceptors['response'];
}

export const createDatabaseRoutes = ({
  router,
  databaseConfig,
  serverResponseInterceptor
}: CreateDatabaseRoutesParams) => {
  const { data, routes } = databaseConfig;

  if (routes) {
    const storage = isVariableJsonFile(routes)
      ? new FileStorage(routes)
      : new MemoryStorage(routes);
    createRewrittenDatabaseRoutes(router, storage.read());

    router.route('/__routes').get((_request, response) => {
      response.json(storage.read());
    });
  }

  const storage = isVariableJsonFile(data) ? new FileStorage(data) : new MemoryStorage(data);
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(storage.read());
  createShallowDatabaseRoutes({
    router,
    database: shallowDatabase,
    storage: storage as MemoryStorage<ShallowDatabase>,
    responseInterceptors: {
      apiInterceptor: databaseConfig.interceptors?.response,
      serverInterceptor: serverResponseInterceptor
    }
  });
  createNestedDatabaseRoutes({
    router,
    database: nestedDatabase,
    storage: storage as MemoryStorage<NestedDatabase>,
    responseInterceptors: {
      apiInterceptor: databaseConfig.interceptors?.response,
      serverInterceptor: serverResponseInterceptor
    }
  });

  router.route('/__db').get((_request, response) => {
    response.json(storage.read());
  });

  return router;
};
