import { FileStorage, MemoryStorage } from '../createDatabaseRoutes/storages';

const isVariableJsonFile = (variable: unknown): variable is `${string}.json` =>
  typeof variable === 'string' && variable.endsWith('.json');

export const createStorage = <Data extends Record<string, unknown> | `${string}.json`>(
  data: Data
) => (isVariableJsonFile(data) ? new FileStorage(data) : new MemoryStorage(data));
