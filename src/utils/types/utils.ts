import type { PlainObject } from './values';

export type ValueOf<T extends PlainObject> = T[keyof T];
export type Entries<T extends PlainObject> = ValueOf<{ [K in keyof T]-?: [K, T[K]] }>[];
export type NestedObject<T> = { [key: string]: NestedObject<T> | T };
