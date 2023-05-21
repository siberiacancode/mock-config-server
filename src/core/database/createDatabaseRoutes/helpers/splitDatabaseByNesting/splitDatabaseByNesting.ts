import { isPlainObject } from '@/utils/helpers';
import type { DatabaseConfig } from '@/utils/types';

const isAllArrayElementsHaveValidId = (array: unknown[]) => (
  array.every((element) => (
    isPlainObject(element) && (typeof element.id === 'string' || typeof element.id === 'number')
  ))
);

export const splitDatabaseByNesting = (databaseConfig: DatabaseConfig) => {
  const shallowDatabase: Record<string, unknown> = {};
  const nestedDatabase: Record<string, unknown[]> = {};
  
  Object.entries(databaseConfig).forEach(([databaseEntityKey, databaseEntityValue]) => {
    if (Array.isArray(databaseEntityValue) && isAllArrayElementsHaveValidId(databaseEntityValue)) {
      shallowDatabase[databaseEntityKey] = databaseEntityValue;
      return;
    }
    nestedDatabase[databaseEntityKey] = databaseEntityValue;
  });

  return { shallowDatabase, nestedDatabase };
};
