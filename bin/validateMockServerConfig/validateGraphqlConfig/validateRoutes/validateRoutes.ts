import type { GraphQLOperationsEntities, GraphQLOperationType } from '../../../../src';
import { isPlainObject } from '../../../../src/utils/helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByOperationType = {
  [Key in keyof GraphQLOperationsEntities]: GraphQLOperationsEntities[Key][];
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntitiesByOperationType = {
  query: ['headers', 'query', 'variables'],
  mutation: ['headers', 'query', 'variables']
};

const validateHeadersOrQuery = (headersOrQuery: unknown, entity: string) => {
  const isHeadersOrQueryObject = isPlainObject(headersOrQuery);
  if (isHeadersOrQueryObject) {
    Object.entries(headersOrQuery).forEach(([headerOrQueryKey, headerOrQueryValue]) => {
      if (typeof headerOrQueryValue !== 'string') {
        throw new Error(`${entity}.${headerOrQueryKey}`);
      }
    });
    return;
  }

  throw new Error(entity);
};

const validateEntities = (entities: unknown, operationType: GraphQLOperationType) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entity) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_OPERATION_TYPE[operationType].includes(
        entity as any
      );
      if (!isEntityAllowed) {
        throw new Error(`entities.${entity}`);
      }

      if (entity === 'headers' || entity === 'query') {
        try {
          const headersOrQuery = entities[entity];
          return validateHeadersOrQuery(headersOrQuery, entity);
        } catch (error: any) {
          throw new Error(`entities.${error.message}`);
        }
      }
    });
    return;
  }

  if (typeof entities !== 'undefined') {
    throw new Error('entities');
  }
};

export const validateRoutes = (routes: unknown, operationType: GraphQLOperationType) => {
  const isRoutesArray = Array.isArray(routes);
  if (isRoutesArray) {
    routes.forEach((route, index) => {
      const isRouteObject = isPlainObject(route);
      if (isRouteObject) {
        const isRouteHasDataProperty = 'data' in route;
        if (!isRouteHasDataProperty) {
          throw new Error(`routes[${index}]`);
        }

        try {
          validateEntities(route.entities, operationType);
          validateInterceptors(route.interceptors);
        } catch (error: any) {
          throw new Error(`routes[${index}].${error.message}`);
        }
        return;
      }

      throw new Error(`routes[${index}]`);
    });
    return;
  }

  throw new Error('routes');
};
