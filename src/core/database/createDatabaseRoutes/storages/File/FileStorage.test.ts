import * as fs from 'fs';

import { FileStorage } from './FileStorage';

jest.mock('fs');

describe('FileStorage', () => {
  const createInitialData = () => ({
    john: { name: 'John Doe', age: 25 },
    jane: { name: 'Jane Smith', age: 30 },
    users: [{ id: 1 }, { id: 2 }]
  });

  describe('FileStorage: read', () => {
    let initialData: ReturnType<typeof createInitialData>;
    let fileStorage: FileStorage;

    beforeEach(() => {
      initialData = createInitialData();
      (fs as jest.Mocked<typeof fs>).readFileSync.mockReturnValueOnce(JSON.stringify(initialData));
      fileStorage = new FileStorage('./mock-database.json');
    });

    afterEach(() => {
      (fs as jest.Mocked<typeof fs>).readFileSync.mockClear();
    });

    test('Should return correct FULL data for read without keys', () => {
      expect(fileStorage.read()).toStrictEqual(initialData);
    });

    test('Should return correct data for read with valid single key', () => {
      expect(fileStorage.read('john')).toStrictEqual(initialData.john);
    });

    test('Should return correct data for read with valid array key', () => {
      expect(fileStorage.read(['john', 'name'])).toStrictEqual(initialData.john.name);
    });
  });

  describe('FileStorage: write', () => {
    let initialData: ReturnType<typeof createInitialData>;
    let fileStorage: FileStorage;

    beforeEach(() => {
      initialData = createInitialData();
      (fs as jest.Mocked<typeof fs>).readFileSync.mockReturnValueOnce(JSON.stringify(initialData));
      fileStorage = new FileStorage('./mock-database.json');
    });

    afterEach(() => {
      (fs as jest.Mocked<typeof fs>).readFileSync.mockClear();
    });

    test('Should update value with valid single key', () => {
      const newAgeJohn = { ...initialData.john, age: 26 };

      fileStorage.write('john', newAgeJohn);

      expect(fileStorage.read('john')).toStrictEqual(newAgeJohn);
    });

    test('Should update value with valid array key', () => {
      const newAge = 26;

      fileStorage.write(['john', 'age'], newAge);

      expect(fileStorage.read(['john', 'age'])).toBe(newAge);
    });

    test('Should update value with valid key which contain non-existent last part', () => {
      fileStorage.write(['john', 'stand'], 'The World');

      expect(fileStorage.read(['john', 'stand'])).toBe('The World');
    });

    test('Should write in file updated data', () => {
      const mockWriteFileSync = jest.fn();
      (fs as jest.Mocked<typeof fs>).writeFileSync.mockImplementation(mockWriteFileSync);
      fileStorage.write(['john', 'stand'], 'The World');

      expect(mockWriteFileSync.mock.calls.length).toBe(1);
      expect(mockWriteFileSync.mock.calls[0][1]).toBe(JSON.stringify(fileStorage.read()));
    });
  });

  describe('FileStorage: delete', () => {
    let initialData: ReturnType<typeof createInitialData>;
    let fileStorage: FileStorage;

    beforeEach(() => {
      initialData = createInitialData();
      (fs as jest.Mocked<typeof fs>).readFileSync.mockReturnValueOnce(JSON.stringify(initialData));
      fileStorage = new FileStorage('./mock-database.json');
    });

    afterEach(() => {
      (fs as jest.Mocked<typeof fs>).readFileSync.mockClear();
    });

    test('Should correctly delete object property with valid single key', () => {
      fileStorage.delete('john');
      expect(fileStorage.read('john')).toBe(undefined);
    });

    test('Should correctly delete object property with valid array key', () => {
      fileStorage.delete(['john', 'age']);
      expect(fileStorage.read('john')).toStrictEqual({ name: initialData.john.name });
    });

    test('Should splice array if delete element from array', () => {
      fileStorage.delete(['users', 0]);

      const updatedUsers = fileStorage.read('users');

      expect(updatedUsers).toStrictEqual([{ id: 2 }]);
      expect(updatedUsers.length).toBe(1);
    });

    test('Should write in file updated data', () => {
      const mockWriteFileSync = jest.fn();
      (fs as jest.Mocked<typeof fs>).writeFileSync.mockImplementation(mockWriteFileSync);
      fileStorage.delete(['users', 0]);

      expect(mockWriteFileSync.mock.calls.length).toBe(1);
      expect(mockWriteFileSync.mock.calls[0][1]).toBe(JSON.stringify(fileStorage.read()));
    });
  });
});
