import { MemoryStorage } from './MemoryStorage';

const initialData = {
  john: { name: 'John Doe', age: 25 },
  jane: { name: 'Jane Smith', age: 30 }
};

describe('MemoryStorage: read', () => {
  const memoryStorage = new MemoryStorage(initialData);

  it('Should return correct data for read with valid single key', () => {
    expect(memoryStorage.read('john')).toStrictEqual(initialData.john);
  });
  
  it('Should throw an error for read with invalid single key', () => {
    expect(() => memoryStorage.read('jim')).toThrowError('Key jim does not exists');
  });
  
  it('Should return correct data for read with valid array key', () => {
    expect(memoryStorage.read(['john', 'name'])).toStrictEqual(initialData.john.name);
  });
  
  it('Should throw an error for read with invalid array key', () => {
    expect(() => memoryStorage.read(['jim', 'name'])).toThrowError('Key jim does not exists');
    expect(() => memoryStorage.read(['john', 'surname'])).toThrowError('Key surname does not exists');
  });
});

describe('MemoryStorage: write', () => {
  let memoryStorage: MemoryStorage;
  beforeEach(() => {
    memoryStorage = new MemoryStorage(initialData);
  });

  it('Should update value with valid single key', () => {
    const newAgeJohn = { ...initialData.john, age: 26 };

    memoryStorage.write('john', newAgeJohn);

    expect(memoryStorage.read('john')).toStrictEqual(newAgeJohn);
  });

  it('Should set new value for non-existent single key', () => {
    const jim = { name: 'Jim Black', age: 40 };

    memoryStorage.write('jim', jim);

    expect(memoryStorage.read('jim')).toStrictEqual(jim);
  });

  it('Should update value with valid array key', () => {
    const newAge = 26;

    memoryStorage.write(['john', 'age'], newAge);

    expect(memoryStorage.read(['john', 'age'])).toBe(newAge);
  });

  it('Should create new objects for non-existent parts of array key', () => {
    const jimName = 'Jim Black';

    memoryStorage.write(['jim', 'name'], jimName);

    expect(memoryStorage.read(['jim', 'name'])).toBe(jimName);
  });
  
  it('Should rewrite non-objects for existent parts of array key', () => {
    const johnFirstName = 'John';

    memoryStorage.write(['john', 'name', 'firstName'], johnFirstName);

    expect(memoryStorage.read(['john', 'name', 'firstName'])).toBe(johnFirstName);
  });
});
