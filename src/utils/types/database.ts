export type Database = Record<string, unknown>;
export type ShallowDatabase = Record<string, unknown>;

export type NestedDatabaseId = number | string;
export type NestedDatabase = Record<string, { id: NestedDatabaseId; [key: string]: unknown }[]>;

export type StorageIndex = string | number;
export interface Storage {
  read(key?: StorageIndex | StorageIndex[]): any;
  write(key: StorageIndex | StorageIndex[], value: unknown): void;
  delete(key: StorageIndex | StorageIndex[]): void;
}

export interface ShallowOrm<Item = unknown> {
  get: () => Item;
  update: (data: Item) => void;
}

export interface NestedOrm<Item = Record<string, unknown>> {
  get: () => Item[];

  create: (data: Omit<Item, 'id'>) => void;
  update: (id: StorageIndex, data: Partial<Omit<Item, 'id'>>) => void;
  delete: (id: string) => void;

  createMany: (data: Item[]) => void;
  updateMany: (ids: StorageIndex[], data: Partial<Omit<Item, 'id'>>[]) => void;
  deleteMany: (ids: StorageIndex[]) => void;

  count: () => number;
}

export type Orm<Database extends Record<string, unknown>> = {
  [Key in keyof Database]: Database[Key] extends Array<infer Item>
    ? Item extends { id: string | number }
      ? NestedOrm<Item>
      : ShallowOrm<Item>
    : ShallowOrm<Database[Key]>;
};
