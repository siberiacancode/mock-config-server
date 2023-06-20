import { isPlainObject } from '@/utils/helpers';

const validateData = (data: unknown) => {
  const isDataObject = isPlainObject(data);
  if (!isDataObject) throw new Error('data');
};

const validateRoutes = (routes: unknown) => {
  const isRoutesObject = isPlainObject(routes);
  if (isRoutesObject) {
    Object.entries(routes).forEach(([routeKey, routeValue]) => {
      if (typeof routeValue !== 'string') {
        throw new Error(`routes.${routeKey}`);
      }
    });
    return;
  }

  if (typeof routes !== 'undefined') {
    throw new Error('routes');
  }
};

export const validateDatabaseConfig = (databaseConfig: unknown) => {
  const isDatabaseConfigObject = isPlainObject(databaseConfig);
  if (isDatabaseConfigObject) {
    try {
      validateData(databaseConfig.data);
      validateRoutes(databaseConfig.routes);
    } catch (error: any) {
      throw new Error(`database.${error.message}`);
    }
    return;
  }

  if (typeof databaseConfig !== 'undefined') {
    throw new Error('database');
  }
};
