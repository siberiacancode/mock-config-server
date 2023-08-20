export type ShallowDatabase = Record<string, unknown>;

export type NestedDatabaseId = number | string;
export type NestedDatabase = Record<string, { id: NestedDatabaseId; [key: string]: unknown }[]>;
