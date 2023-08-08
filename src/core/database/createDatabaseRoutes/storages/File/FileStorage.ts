import fs from 'fs';
import path from 'path';

import { isIndex } from '@/utils/helpers';

import { FileWriter } from './FileWriter';

type Index = string | number;
type Object = Record<Index, any>;

export class FileStorage<T extends Object = Object> {
  private readonly fileWriter: FileWriter;

  private readonly data: T;

  public constructor(fileName: string) {
    const filePath = path.resolve(process.cwd(), fileName);
    this.fileWriter = new FileWriter(filePath);
    this.data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  public read(baseKey?: Index | Index[]): any {
    if (!baseKey) return this.data;

    const key = Array.isArray(baseKey) ? baseKey : [baseKey];
    let readable: any = this.data;
    let index = 0;
    while (typeof readable === 'object' && readable !== null && index < key.length) {
      readable = readable[key[index]];
      index += 1;
    }
    return index === key.length ? readable : undefined;
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

    this.fileWriter.write(JSON.stringify(this.data, null, 2));
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
    } else {
      delete deletable[key[index]];
    }

    this.fileWriter.write(JSON.stringify(this.data, null, 2));
  }
}
