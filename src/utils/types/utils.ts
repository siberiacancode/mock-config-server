import type { PlainObject } from './values';

export type ValueOf<T extends PlainObject> = T[keyof T];
export type Entries<T extends PlainObject> = ValueOf<{ [K in keyof T]-?: [K, T[K]] }>[];
export type NestedObjectOrArray<T> =
  | { [key: string]: NestedObjectOrArray<T> | T }
  | Array<NestedObjectOrArray<T> | T>;
