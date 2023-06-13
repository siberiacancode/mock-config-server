import { isIndex } from '@/utils/helpers';

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
    while (typeof readable === 'object' && readable !== null && index < key.length) {
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
      const isCurrentKeyPartObject =
        typeof writable[key[index]] === 'object' && writable[key[index]] !== null;
      if (!isCurrentKeyPartObject) {
        const isNextKeyPartArrayIndex = isIndex(key[index + 1]);
        writable[key[index]] = isNextKeyPartArrayIndex ? [] : {};
      }
      writable = writable[key[index]];
      index += 1;
    }
  }

  public delete(baseKey: Index | Index[]): void {
    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let deletable: any = this.data;
    let index = 0;
    while (typeof deletable === 'object' && deletable !== null && index < key.length - 1) {
      deletable = deletable[key[index]];
      index += 1;
    }

    // ✅ important:
    // stop iterate for one element before end of key for get access to deletable object property
    if (
      index === key.length - 1 &&
      typeof deletable === 'object' &&
      deletable !== null &&
      key[index] in deletable
    ) {
      if (Array.isArray(deletable) && isIndex(key[index])) {
        deletable.splice(key[index] as number, 1);
        return;
      }
      delete deletable[key[index]];
    }
  }
}
