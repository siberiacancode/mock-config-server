import type { Request } from 'express';

import type {
  Entries,
  GraphQLEntitiesByEntityName,
  GraphQLRequestArtifact,
  PlainObject
} from '@/utils/types';

import { isComparator, resolveEntityValues } from '@/utils/helpers';

import { equals } from '../../../../entities';

interface IsGraphQLRequestMatchedByEntitiesParams {
  request: Request;
  variables?: PlainObject;
}

export const isGraphQLRequestMatchedByEntities = (
  { request, variables }: IsGraphQLRequestMatchedByEntitiesParams,
  entities: GraphQLRequestArtifact['config']['entities']
) => {
  if (!entities) return true;

  const entityEntries = Object.entries(entities) as Entries<Required<GraphQLEntitiesByEntityName>>;

  return entityEntries.every(([entityName, valueOrComparator]) => {
    const actualEntity = entityName === 'variables' ? variables : request[entityName];

    if (isComparator(valueOrComparator)) {
      return resolveEntityValues({ actual: actualEntity, comparator: valueOrComparator });
    }

    if (entityName === 'variables') {
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
