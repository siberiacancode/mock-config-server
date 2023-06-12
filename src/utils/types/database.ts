export type ShallowDatabase = Record<string, unknown>;
export type NestedDatabaseItem = { id: number | string; [key: string]: unknown };
export type NestedDatabase = Record<string, NestedDatabaseItem[]>;
