import type { NestedOrm, ShallowOrm, Storage } from '@/utils/types';

import { createNewId, splitDatabaseByNesting } from '../createDatabaseRoutes/helpers';

export const createOrm = (storage: Storage) => {
  const { shallowDatabase, nestedDatabase } = splitDatabaseByNesting(storage.read());

  const nestedOrm = Object.entries(nestedDatabase).reduce(
    (orm, [key, value]) => {
      orm[key] = {
        get: () => value,
        count: () => value.length,
        delete: (id) => storage.delete([key, id]),
        update: (id, data) => {
          const currentResource = storage.read([key, id]);
          const updatedResource = { ...data, id: currentResource.id };
          storage.write([key, id], updatedResource);
        },
        create: (data) => {
          const collection = storage.read(key);
          const newResourceId = createNewId(collection);
          const newResource = { ...data, id: newResourceId };
          storage.write([key, value.length], newResource);
        },
        createMany: (data) =>
          data.forEach((element) => {
            const collection = storage.read(key);
            const newResourceId = createNewId(collection);
            const newResource = { ...element, id: newResourceId };
            storage.write([key, value.length], newResource);
          }),
        deleteMany: (ids) =>
          ids.forEach((id) => {
            storage.delete([key, id]);
          }),
        updateMany: (ids, data) =>
          ids.forEach((id) => {
            const currentResource = storage.read([key, id]);
            const updatedResource = { ...data, id: currentResource.id };
            storage.write([key, id], updatedResource);
          })
      };

      return orm;
    },
    {} as { [key: string]: NestedOrm }
  );

  const shallowOrm = Object.entries(shallowDatabase).reduce(
    (orm, [key, value]) => {
      orm[key] = {
        get: () => value,
        update: (data) => storage.write([key], data)
      };

      return orm;
    },
    {} as { [key: string]: ShallowOrm }
  );

  return {
    ...nestedOrm,
    ...shallowOrm
  };
};
