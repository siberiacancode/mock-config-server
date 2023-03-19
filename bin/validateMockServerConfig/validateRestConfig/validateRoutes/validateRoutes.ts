import type { RestMethod, RestMethodsEntities } from '../../../../src';
import { isPlainObject } from '../../../../src/utils/helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByMethod = {
  [Key in keyof RestMethodsEntities]: RestMethodsEntities[Key][];
};
const ALLOWED_ENTITIES_BY_METHOD: AllowedEntitiesByMethod = {
  get: ['headers', 'query', 'params'],
  delete: ['headers', 'query', 'params'],
  post: ['headers', 'query', 'params', 'body'],
  put: ['headers', 'query', 'params', 'body'],
  patch: ['headers', 'query', 'params', 'body']
};

const validateHeadersOrParams = (headersOrParams: unknown, entity: string) => {
  const isHeadersOrParamsObject = isPlainObject(headersOrParams);
  if (isHeadersOrParamsObject) {
    Object.entries(headersOrParams).forEach(([headerOrParamKey, headerOrParamValue]) => {
      if (typeof headerOrParamValue !== 'string') {
        throw new Error(`${entity}.${headerOrParamKey}`);
      }
    });
    return;
  }

  throw new Error(entity);
};

const validateQuery = (query: unknown, entity: string) => {
  const isQueryObject = isPlainObject(query);
  if (isQueryObject) {
    Object.entries(query).forEach(([queryKey, queryValue]) => {
      const isQueryValueArray = Array.isArray(queryValue);
      if (isQueryValueArray) {
        queryValue.forEach((queryValueElement, index) => {
          if (typeof queryValueElement !== 'string') {
            throw new Error(`${entity}.${queryKey}[${index}]`);
          }
        });
        return;
      }

      if (typeof queryValue !== 'string') {
        throw new Error(`${entity}.${queryKey}`);
      }
    });
    return;
  }

  throw new Error(entity);
};

const validateEntities = (entities: unknown, method: RestMethod) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entity) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_METHOD[method].includes(entity as any);
      if (!isEntityAllowed) {
        throw new Error(`entities.${entity}`);
      }

      if (entity === 'headers' || entity === 'params') {
        try {
          const headersOrParams = entities[entity];
          validateHeadersOrParams(headersOrParams, entity);
        } catch (error: any) {
          throw new Error(`entities.${error.message}`);
        }
      }

      if (entity === 'query') {
        try {
          const query = entities[entity];
          validateQuery(query, entity);
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

export const validateRoutes = (routes: unknown, method: RestMethod) => {
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
          validateEntities(route.entities, method);
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
