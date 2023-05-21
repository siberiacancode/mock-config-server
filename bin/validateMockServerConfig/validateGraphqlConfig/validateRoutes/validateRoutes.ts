import { isPlainObject } from '@/utils/helpers';
import type { GraphQLOperationsEntities, GraphQLOperationType } from '@/utils/types';

import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByOperationType = {
  [Key in keyof GraphQLOperationsEntities]: GraphQLOperationsEntities[Key][];
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntitiesByOperationType = {
  query: ['headers', 'cookies', 'query', 'variables'],
  mutation: ['headers', 'cookies', 'query', 'variables']
};

const validateHeadersOrCookiesOrQuery = (headersOrCookiesOrQuery: unknown, entity: string) => {
  const isHeadersOrCookiesOrQueryObject = isPlainObject(headersOrCookiesOrQuery);
  if (isHeadersOrCookiesOrQueryObject) {
    Object.entries(headersOrCookiesOrQuery).forEach(([headerOrCookieOrQueryKey, headerOrCookieOrQueryValue]) => {
      if (typeof headerOrCookieOrQueryValue !== 'string') {
        throw new Error(`${entity}.${headerOrCookieOrQueryKey}`);
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

      if (entity === 'headers' || entity === 'query' || entity === 'cookies') {
        try {
          const headersOrCookiesOrQuery = entities[entity];
          validateHeadersOrCookiesOrQuery(headersOrCookiesOrQuery, entity);
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
