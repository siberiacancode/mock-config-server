import type { DatabaseConfig } from '@/utils/types';

import { splitDatabaseByNesting } from './splitDatabaseByNesting';

describe('splitDatabaseByNesting', () => {
  test('Should put in nested database only arrays of objects with id (string | number)', () => {
    const databaseConfig: DatabaseConfig = {
      key: 'value',
      validArray: [
        { id: 1, key: 'value' },
        { id: 'string', key: 'value' }
      ],
      invalidArray: [{ id: 1, key: 'value' }, null]
    };

    const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig);

    expect(shallowDatabase).toStrictEqual({
      key: databaseConfig.key,
      invalidArray: databaseConfig.invalidArray
    });
    expect(nestedDatabase).toStrictEqual({
      validArray: databaseConfig.validArray
    });
  });
});
