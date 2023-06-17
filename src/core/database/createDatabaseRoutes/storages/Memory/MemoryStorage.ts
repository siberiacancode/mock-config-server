import { isIndex } from '@/utils/helpers';

type Index = string | number;
type Object = Record<Index, any>;

export class MemoryStorage<T extends Object = Object> {
  private readonly data: T;

  public constructor(initialData: T) {
    this.data = initialData;
  }

  public read(baseKey?: Index | Index[]): any {
    if (!baseKey) return this.data;

    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let readable: any = this.data;
    let index = 0;
    while (index < key.length) {
      readable = readable[key[index]];
      index += 1;
    }
    return readable;
  }

  public write<V>(baseKey: Index | Index[], value: V): void {
    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let writable: any = this.data;
    let index = 0;
    while (index < key.length - 1) {
      writable = writable[key[index]];
      index += 1;
    }

    // ✅ important:
    // stop iterate for one element before end of key for get access to writable object property
    writable[key[index]] = value;
  }

  public delete(baseKey: Index | Index[]): void {
    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let deletable: any = this.data;
    let index = 0;
    while (index < key.length - 1) {
      deletable = deletable[key[index]];
      index += 1;
    }

    // ✅ important:
    // stop iterate for one element before end of key for get access to deletable object property
    if (Array.isArray(deletable) && isIndex(key[index])) {
      deletable.splice(key[index] as number, 1);
      return;
    }
    delete deletable[key[index]];
  }
}
