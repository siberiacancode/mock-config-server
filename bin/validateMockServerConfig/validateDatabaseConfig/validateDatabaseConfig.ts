import { isPlainObject } from '@/utils/helpers';

export const validateDatabaseConfig = (databaseConfig: unknown) => {
  const isDatabaseConfigObject = isPlainObject(databaseConfig);
  if (isDatabaseConfigObject) {
    return;
  }

  if (typeof databaseConfig !== 'undefined') {
    throw new Error('database');
  }
};
