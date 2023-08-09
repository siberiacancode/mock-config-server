import { splitDatabaseByNesting } from './splitDatabaseByNesting';

describe('splitDatabaseByNesting', () => {
  test('Should put in nested database only arrays of objects with id (string | number)', () => {
    const databaseConfig = {
      data: {
        key: 'value',
        invalidArray: [{ id: 1 }, null],
        validArray: [{ id: 1 }, { id: 'string' }]
      }
    };

    const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(databaseConfig.data);

    expect(shallowDatabase).toStrictEqual({
      key: databaseConfig.data.key,
      invalidArray: databaseConfig.data.invalidArray
    });
    expect(nestedDatabase).toStrictEqual({
      validArray: databaseConfig.data.validArray
    });
  });
});
