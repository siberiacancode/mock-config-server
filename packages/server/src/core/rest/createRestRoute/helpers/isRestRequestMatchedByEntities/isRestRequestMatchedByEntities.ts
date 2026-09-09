import type { Request } from 'express';

import type { Entries, RestEntitiesByEntityName, RestRequestArtifact } from '@/utils/types';

import { isComparator, resolveEntityValues } from '@/utils/helpers';

import { equals } from '../../../../entities';

export const isRestRequestMatchedByEntities = (
  request: Request,
  entities: RestRequestArtifact['config']['entities']
) => {
  if (!entities) return true;

  const entityEntries = Object.entries(entities) as Entries<Required<RestEntitiesByEntityName>>;

  return entityEntries.every(([entityName, valueOrComparator]) => {
    const actualEntity = request[entityName];

    if (isComparator(valueOrComparator)) {
      return resolveEntityValues({ actual: actualEntity, comparator: valueOrComparator });
    }

    if (entityName === 'body') {
      return resolveEntityValues({ actual: actualEntity, comparator: equals(valueOrComparator) });
    }

    const mappedEntityEntries = Object.entries(valueOrComparator) as Entries<
      typeof valueOrComparator
    >;

    return mappedEntityEntries.every(([entityPropertyKey, valueOrComparator]) => {
      // ✅ important:
      // transform header keys to lower case
      // because browsers send headers in lowercase
      const actualPropertyKey =
        entityName === 'headers' ? entityPropertyKey.toLowerCase() : entityPropertyKey;
      const actualPropertyValue = actualEntity[actualPropertyKey];

      const comparator = isComparator(valueOrComparator)
        ? valueOrComparator
        : equals(valueOrComparator);

      return resolveEntityValues({ actual: actualPropertyValue, comparator });
    });
  });
};
