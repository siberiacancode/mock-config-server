import { isPlainObject } from '@/utils/helpers';
import type { PlainObject } from '@/utils/types';

export class MemoryStorage<T extends PlainObject = PlainObject> {
  private readonly data: T;

  public constructor(initialData: T) {
    this.data = initialData;
  }
  
  public read(key: string | string[]) {
    if (!Array.isArray(key)) {
      if (key in this.data) {
        return this.data[key];
      }
      throw new Error(`Key ${key as string} does not exists`);
    }

    let value: unknown = this.data;
    key.forEach((keyPart) => {
      if (isPlainObject(value) && keyPart in value) {
        value = value[keyPart];
        return;
      }
      throw new Error(`Key ${keyPart as string} does not exists`);
    });
    return value;
  }
  
  public write(key: string | string[], value: unknown) {
    if (!Array.isArray(key)) {
      this.data[key as keyof T] = value as T[keyof T];
      return;
    }
    
    let writable: unknown = this.data;
    key.forEach((keyPart, index) => {
      if (!isPlainObject(writable)) {
        throw new Error(`Key ${keyPart as string} cannot be created`);
      }

      if (index === key.length - 1) {
        writable[keyPart] = value;
        return;
      }

      if (!(keyPart in writable) || !isPlainObject(writable[keyPart])) {
        writable[keyPart] = {};
      }
      writable = writable[keyPart];
    });
  }
}
