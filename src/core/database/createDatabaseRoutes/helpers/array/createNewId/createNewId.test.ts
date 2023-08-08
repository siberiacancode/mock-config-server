import { createNewId } from './createNewId';

describe('createNewId', () => {
  test('Should increment max numeric id in array on 1', () => {
    const array = [{ id: 1 }, { id: 'string' }, { id: 1000 }];
    expect(createNewId(array)).toBe(1001);
  });

  test('Should return 0 if no numeric ids in array', () => {
    const array = [{ id: 'string' }];
    expect(createNewId(array)).toBe(0);
  });
});
