import type { PlainObject } from './values';

export type ValueOf<T extends PlainObject | Array<any>> =
  T extends Array<any> ? T[number] : T[keyof T];

export type Entries<T extends PlainObject | Array<any>> = ValueOf<{
  [K in keyof T]-?: [K, T[K]];
}>[];

export type NestedObjectOrArray<T> =
  | { [key: string]: NestedObjectOrArray<T> | T }
  | Array<NestedObjectOrArray<T> | T>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;
