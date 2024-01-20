import { isPlainObject } from '@/utils/helpers';

const validateData = (data: unknown) => {
  const isDataObject = isPlainObject(data);
  const isDataJsonFilePath = typeof data === 'string' && data.endsWith('.json');
  if (!isDataObject && !isDataJsonFilePath) throw new Error('data');
};

const validateRoutes = (routes: unknown) => {
  const isRoutesObject = isPlainObject(routes);
  if (isRoutesObject) {
    Object.entries(routes).forEach(([routeKey, routeValue]) => {
      const isKeyRoutePath = routeKey.startsWith('/');
      const isValueRoutePath = typeof routeValue === 'string' && routeValue.startsWith('/');
      if (!isKeyRoutePath || !isValueRoutePath) {
        throw new Error(`routes.${routeKey}`);
      }
    });
    return;
  }

  const isRoutesJsonFilePath = typeof routes === 'string' && routes.endsWith('.json');
  if (!isRoutesJsonFilePath && typeof routes !== 'undefined') {
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
