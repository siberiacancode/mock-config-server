type Index = string | number;
type MemoryObject = Record<Index, any>;

export class MemoryStorage<T extends MemoryObject = MemoryObject> {
  private readonly data: T;

  public constructor(initialData: T) {
    this.data = initialData;
  }

  public read(baseKey: Index | Index[]): any {
    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let readable: any = this.data;
    let index = 0;
    while ((typeof readable === 'object' && readable !== null) && index < key.length) {
      readable = readable[key[index]];
      index += 1;
    }
    return index === key.length ? readable : undefined;
  }

  public write<V>(baseKey: Index | Index[], value: V): V {
    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let writable: any = this.data;
    let index = 0;
    while (true) {
      if (index === key.length - 1) {
        writable[key[index]] = value;
        return value;
      }
      const isCurrentKeyPartObject = typeof writable[key[index]] === 'object' && writable[key[index]] !== null;
      if (!isCurrentKeyPartObject) {
        const isNextKeyPartArrayIndex = Number.isInteger(key[index + 1]) && key[index + 1] >= 0
        writable[key[index]] = isNextKeyPartArrayIndex ? [] : {};
      }
      writable = writable[key[index]];
      index += 1;
    }
  }
}
