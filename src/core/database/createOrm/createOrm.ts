import { flatten } from 'flat';

import type { Database, NestedOrm, Orm, ShallowOrm, Storage } from '@/utils/types';

import {
  createNewId,
  findIndexById,
  splitDatabaseByNesting
} from '../createDatabaseRoutes/helpers';

export const createOrm = (storage: Storage) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(storage.read());

  const nestedOrm = Object.keys(nestedDatabase).reduce(
    (orm, key) => {
      orm[key] = {
        get: () => storage.read(key),

        create: (item) => {
          const collection = storage.read(key);
          if (!collection) throw new Error('Collection not found');
          const newResourceId = createNewId(collection);
          const newResource = { ...item, id: newResourceId };
          storage.write([key, collection.length], newResource);

          return newResource;
        },
        delete: (id) => storage.delete([key, id]),
        update: (id, item) => {
          const collection = storage.read(key);
          const currentResourceIndex = findIndexById(collection, id);

          const currentResource = storage.read([key, currentResourceIndex]);
          const updatedRecord = { ...currentResource, ...item, id };

          storage.write([key, currentResourceIndex], updatedRecord);

          return updatedRecord;
        },

        createMany: (data) =>
          data.forEach((element) => {
            const collection = storage.read(key);
            const newResourceId = createNewId(collection);
            const newResource = { ...element, id: newResourceId };
            storage.write([key, collection.length], newResource);
          }),
        deleteMany: (ids) => {
          const collection = storage.read(key);
          ids.forEach((id) => {
            const index = findIndexById(collection, id);
            storage.delete([key, index]);
          });
        },
        updateMany: (ids, item) => {
          ids.forEach((id) => {
            const collection = storage.read(key);
            const currentResourceIndex = findIndexById(collection, id);
            const currentResource = storage.read([key, currentResourceIndex]);
            const updatedRecord = { ...currentResource, ...item, id };
            storage.write([key, currentResourceIndex], updatedRecord);
          });

          return ids.length;
        },

        findById: (id) => {
          const collection = storage.read(key);
          const currentResourceIndex = findIndexById(collection, id);
          return storage.read([key, currentResourceIndex]);
        },
        findMany: (filters) => {
          const collection = storage.read(key);

          const flattendFiltters = flatten<any, any>(filters);
          return collection.filter((resource: any) => {
            const flattendResource = flatten<any, any>(resource);
            return Object.entries(flattendFiltters).every(
              ([key, value]) => flattendResource[key] === value
            );
          });
        },
        findFirst: (filters) => {
          const collection = storage.read(key);

          const flattendFiltters = flatten<any, any>(filters);
          return collection.find((resource: any) => {
            const flattendResource = flatten<any, any>(resource);
            return Object.entries(flattendFiltters).every(
              ([key, value]) => flattendResource[key] === value
            );
          });
        },
        exists: (filters) => {
          const collection = storage.read(key);

          const flattendFiltters = flatten<any, any>(filters);
          return collection.some((resource: any) => {
            const flattendResource = flatten<any, any>(resource);
            return Object.entries(flattendFiltters).every(
              ([key, value]) => flattendResource[key] === value
            );
          });
        },

        count: () => storage.read(key).length
      };

      return orm;
    },
    {} as { [key: string]: NestedOrm }
  );

  const shallowOrm = Object.keys(shallowDatabase).reduce(
    (orm, key) => {
      orm[key] = {
        get: () => storage.read(key),
        update: (data) => {
          storage.write(key, data);
          console.log('@key', key, data);
        }
      };

      return orm;
    },
    {} as { [key: string]: ShallowOrm }
  );

  return {
    ...nestedOrm,
    ...shallowOrm
  } as Orm<Database>;
};
