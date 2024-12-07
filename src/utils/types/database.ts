export interface Database extends Record<string, unknown> {}
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

  create: (item: Omit<Item, 'id'>) => void;
  update: (id: StorageIndex, item: Partial<Omit<Item, 'id'>>) => void;
  delete: (id: StorageIndex) => void;

  createMany: (items: Item[]) => void;
  updateMany: (ids: StorageIndex[], item: Partial<Omit<Item, 'id'>>) => void;
  deleteMany: (ids: StorageIndex[]) => void;

  findById: (id: StorageIndex) => Item | undefined;
  findMany: (filters: Partial<Item>) => Item[];
  findFirst: (filters: Partial<Item>) => Item | undefined;
  exists: (filters: Partial<Item>) => boolean;

  count: () => number;
}

export type Orm<Database extends Record<string, unknown>> = {
  [Key in keyof Database]: Database[Key] extends Array<infer Item>
    ? Item extends { id: StorageIndex }
      ? NestedOrm<Item>
      : ShallowOrm<Database[Key]>
    : ShallowOrm<Database[Key]>;
};
