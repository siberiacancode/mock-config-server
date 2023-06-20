import { isPlainObject } from '@/utils/helpers';
import type { DatabaseConfig, NestedDatabase, ShallowDatabase } from '@/utils/types';

const isAllArrayElementsHaveValidId = (array: unknown[]) =>
  array.every(
    (element) =>
      isPlainObject(element) && (typeof element.id === 'number' || typeof element.id === 'string')
  );

export const splitDatabaseByNesting = (data: DatabaseConfig['data']) => {
  const shallowDatabase: ShallowDatabase = {};
  const nestedDatabase: NestedDatabase = {};

  Object.entries(data).forEach(([databaseEntityKey, databaseEntityValue]) => {
    if (Array.isArray(databaseEntityValue) && isAllArrayElementsHaveValidId(databaseEntityValue)) {
      nestedDatabase[databaseEntityKey] = databaseEntityValue;
      return;
    }
    shallowDatabase[databaseEntityKey] = databaseEntityValue;
  });

  return { shallowDatabase, nestedDatabase };
};
