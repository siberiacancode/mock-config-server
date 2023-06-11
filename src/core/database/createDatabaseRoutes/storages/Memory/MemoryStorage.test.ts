import { MemoryStorage } from './MemoryStorage';

describe('MemoryStorage', () => {
  const createInitialData = () => ({
    john: { name: 'John Doe', age: 25 },
    jane: { name: 'Jane Smith', age: 30 }
  });

  describe('MemoryStorage: read', () => {
    const initialData = createInitialData();
    const memoryStorage = new MemoryStorage(initialData);

    test('Should return correct data for read with valid single key', () => {
      expect(memoryStorage.read('john')).toStrictEqual(initialData.john);
    });

    test('Should return undefined for read with invalid single key', () => {
      expect(memoryStorage.read('jim')).toBe(undefined);
    });

    test('Should return correct data for read with valid array key', () => {
      expect(memoryStorage.read(['john', 'name'])).toStrictEqual(initialData.john.name);
    });

    test('Should return undefined for read with invalid array key', () => {
      expect(memoryStorage.read(['jim', 'name'])).toBe(undefined);
      expect(memoryStorage.read(['jim', 'surname'])).toBe(undefined);
    });
  });

  describe('MemoryStorage: write', () => {
    let initialData: ReturnType<typeof createInitialData>;
    let memoryStorage: MemoryStorage<typeof initialData>;
    beforeEach(() => {
      initialData = createInitialData();
      memoryStorage = new MemoryStorage(initialData);
    });

    test('Should update value with valid single key', () => {
      const newAgeJohn = { ...initialData.john, age: 26 };

      memoryStorage.write('john', newAgeJohn);

      expect(memoryStorage.read('john')).toStrictEqual(newAgeJohn);
    });

    test('Should set new value for non-existent single key', () => {
      const jim = { name: 'Jim Black', age: 40 };

      memoryStorage.write('jim', jim);

      expect(memoryStorage.read('jim')).toStrictEqual(jim);
    });

    test('Should update value with valid array key', () => {
      const newAge = 26;

      memoryStorage.write(['john', 'age'], newAge);

      expect(memoryStorage.read(['john', 'age'])).toBe(newAge);
    });

    test('Should create object if some part of array key (not last part) does not exists', () => {
      memoryStorage.write(['john', 'stand', 'name'], 'The World');

      expect(memoryStorage.read(['john', 'stand'])).toStrictEqual({ name: 'The World' });
    });

    test('Should create array if some part of array key is non-negative number and does not exists', () => {
      memoryStorage.write(['users', 0, 'id'], 1);

      expect(memoryStorage.read('users')).toStrictEqual([{ id: 1 }]);
    });
  });
});
