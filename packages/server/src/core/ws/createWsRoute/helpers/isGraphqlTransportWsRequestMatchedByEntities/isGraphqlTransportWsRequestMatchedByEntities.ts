import type {
  Entries,
  GraphQLEntitiesByEntityName,
  GraphqlTransportWsRequestArtifact,
  PlainObject
} from '@/utils/types';

import { isComparator, resolveEntityValues } from '@/utils/helpers';

import { equals } from '../../../../entities';

export const isGraphqlTransportWsRequestMatchedByEntities = (
  variables: PlainObject | null | undefined,
  entities: GraphqlTransportWsRequestArtifact['config']['entities']
) => {
  if (!entities) return true;

  const entityEntries = Object.entries(entities) as Entries<Required<GraphQLEntitiesByEntityName>>;

  return entityEntries.every(([_, valueOrComparator]) => {
    const comparator = isComparator(valueOrComparator)
      ? valueOrComparator
      : equals(valueOrComparator);

    return resolveEntityValues({ actual: variables, comparator });
  });
};
