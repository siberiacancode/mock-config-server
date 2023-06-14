import { findIndexById } from '@/utils/helpers';

describe('findIndexById', () => {
  test('Should return index of item by id', () => {
    const array = [{ id: 1 }, { id: 2 }];
    expect(findIndexById(array, 2)).toBe(1);
  });

  test('Should return -1 if item with id does not exists', () => {
    const array = [{ id: 1 }, { id: 2 }];
    expect(findIndexById(array, 3)).toBe(-1);
  });

  test('Should compare ids independently of type: string or number', () => {
    const array = [{ id: 1 }, { id: 2 }];
    expect(findIndexById(array, '2')).toBe(1);
  });
});
