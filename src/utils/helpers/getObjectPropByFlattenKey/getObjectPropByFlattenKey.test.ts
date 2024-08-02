import { getObjectPropByFlattenKey } from './getObjectPropByFlattenKey';

describe('getObjectPropByFlattenKey', () => {
  const testObject = {
    obj: {
      key1: {
        arr: [1, 2, 3]
      }
    }
  };
  const testArray = [{ key1: 'value1', key2: [1] }];

  test('Should return original object or array if key not passed', () => {
    expect(getObjectPropByFlattenKey(testObject)).toEqual({
      obj: {
        key1: {
          arr: [1, 2, 3]
        }
      }
    });

    expect(getObjectPropByFlattenKey(testArray)).toEqual([{ key1: 'value1', key2: [1] }]);
  });

  test('Should return original object or array if key is empty', () => {
    expect(getObjectPropByFlattenKey(testObject, '')).toEqual({
      obj: {
        key1: {
          arr: [1, 2, 3]
        }
      }
    });

    expect(getObjectPropByFlattenKey(testArray, '')).toEqual([{ key1: 'value1', key2: [1] }]);
  });

  test('Should return correct part of object or array if non-flatten key passed', () => {
    expect(getObjectPropByFlattenKey(testObject, 'obj')).toEqual({
      key1: {
        arr: [1, 2, 3]
      }
    });

    expect(getObjectPropByFlattenKey(testArray, '0')).toEqual({ key1: 'value1', key2: [1] });
  });

  test('Should return correct part of object or array if flatten key passed', () => {
    expect(getObjectPropByFlattenKey(testObject, 'obj.key1')).toEqual({
      arr: [1, 2, 3]
    });
    expect(getObjectPropByFlattenKey(testObject, 'obj.key1.arr.2')).toEqual(3);

    expect(getObjectPropByFlattenKey(testArray, '0.key2.0')).toEqual(1);
  });
});
