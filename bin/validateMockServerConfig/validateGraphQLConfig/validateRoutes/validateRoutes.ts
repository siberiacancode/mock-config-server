import type { GraphQLOperationsEntities, GraphQLOperationType } from '../../../../src';
import { isPlainObject } from '../../../../src/utils/helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByOperationType = {
  [Key in keyof GraphQLOperationsEntities]: GraphQLOperationsEntities[Key][]
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntitiesByOperationType = {
  query: ['headers', 'query', 'variables'],
  mutation: ['headers', 'query', 'variables']
};

const validateHeadersOrQuery = (headersOrQuery: unknown) => {
  const isHeadersOrQueryObject = isPlainObject(headersOrQuery);
  if (isHeadersOrQueryObject) {
    Object.values(headersOrQuery).forEach((headerOrQuery) => {
      if (typeof headerOrQuery !== 'string') {
        throw new Error();
      }
    });
    return;
  }

  throw new Error();
};

const validateEntities = (entities: unknown, operationType: GraphQLOperationType) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entity) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_OPERATION_TYPE[operationType].includes(entity as any);
      if (!isEntityAllowed) {
        throw new Error();
      }

      if (entity === 'headers' || entity === 'query') {
        const headersOrQuery = entities[entity];
        return validateHeadersOrQuery(headersOrQuery);
      }
    });
    return;
  }

  if (typeof entities !== 'undefined') {
    throw new Error();
  }
};

export const validateRoutes = (routes: unknown, operationType: GraphQLOperationType) => {
  const isRoutesArray = Array.isArray(routes);
  if (isRoutesArray) {
    routes.forEach((route) => {
      validateEntities(route.entities, operationType);
      validateInterceptors(route.interceptors);
    });
    return;
  }

  throw new Error();
};
