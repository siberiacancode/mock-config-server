import { MemoryStorage } from './MemoryStorage';

describe('MemoryStorage', () => {
  const createInitialData = () => ({
    john: { name: 'John Doe', age: 25 },
    jane: { name: 'Jane Smith', age: 30 },
    users: [{ id: 1 }, { id: 2 }]
  });

  describe('MemoryStorage: read', () => {
    const initialData = createInitialData();
    const memoryStorage = new MemoryStorage(initialData);

    test('Should return correct full data for read without keys', () => {
      expect(memoryStorage.read()).toStrictEqual(initialData);
    });

    test('Should return correct data for read with valid single key', () => {
      expect(memoryStorage.read('john')).toStrictEqual(initialData.john);
    });

    test('Should return correct data for read with valid array key', () => {
      expect(memoryStorage.read(['john', 'name'])).toStrictEqual(initialData.john.name);
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
      const johnWithNewAge = { ...initialData.john, age: initialData.john.age + 1 };

      memoryStorage.write('john', johnWithNewAge);

      expect(memoryStorage.read('john')).toStrictEqual(johnWithNewAge);
    });

    test('Should update value with valid array key', () => {
      const newAge = initialData.john.age + 1;

      memoryStorage.write(['john', 'age'], newAge);

      expect(memoryStorage.read(['john', 'age'])).toBe(newAge);
    });

    test('Should update value with valid key which contain non-existent last part', () => {
      const stand = initialData.john.age + 1;

      memoryStorage.write(['john', 'stand'], stand);

      expect(memoryStorage.read(['john', 'stand'])).toBe(stand);
    });
  });

  describe('MemoryStorage: delete', () => {
    let initialData: ReturnType<typeof createInitialData>;
    let memoryStorage: MemoryStorage<typeof initialData>;

    beforeEach(() => {
      initialData = createInitialData();
      memoryStorage = new MemoryStorage(initialData);
    });

    test('Should correctly delete object property with valid single key', () => {
      expect(memoryStorage.read('john')).toStrictEqual(initialData.john);

      memoryStorage.delete('john');

      expect(memoryStorage.read('john')).toBe(undefined);
    });

    test('Should correctly delete object property with valid array key', () => {
      expect(memoryStorage.read('john')).toStrictEqual(initialData.john);

      memoryStorage.delete(['john', 'age']);

      expect(memoryStorage.read('john')).toStrictEqual({ name: initialData.john.name });
    });

    test('Should splice array if delete element from array', () => {
      expect(memoryStorage.read('users')).toStrictEqual(initialData.users);

      memoryStorage.delete(['users', 0]);

      const updatedUsers = memoryStorage.read('users');
      expect(updatedUsers).toStrictEqual([{ id: 2 }]);
      expect(updatedUsers.length).toBe(1);
    });
  });
});
