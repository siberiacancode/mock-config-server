import type { RestMethod, RestMethodsEntities } from '../../../../src';
import { isPlainObject } from '../../../../src/utils/helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByMethod = {
  [Key in keyof RestMethodsEntities]: RestMethodsEntities[Key][]
};
const ALLOWED_ENTITIES_BY_METHOD: AllowedEntitiesByMethod = {
  get: ['headers', 'query', 'params'],
  delete: ['headers', 'query', 'params'],
  post: ['headers', 'query', 'params', 'body'],
  put: ['headers', 'query', 'params', 'body'],
  patch: ['headers', 'query', 'params', 'body']
};

const validateHeadersOrParams = (headersOrParams: unknown) => {
  const isHeadersOrParamsObject = isPlainObject(headersOrParams);
  if (isHeadersOrParamsObject) {
    Object.values(headersOrParams).forEach((headerOrParam) => {
      if (typeof headerOrParam !== 'string') {
        throw new Error();
      }
    });
    return;
  }

  throw new Error();
};

const validateQuery = (query: unknown) => {
  const isQueryObject = isPlainObject(query);
  if (isQueryObject) {
    Object.values(query).forEach((queryPart) => {
      const isQueryPartArray = Array.isArray(queryPart);
      if (isQueryPartArray) {
        queryPart.forEach((queryPartElement) => {
          if (typeof queryPartElement !== 'string') {
            throw new Error();
          }
        });
        return;
      }

      if (typeof queryPart !== 'string') {
        throw new Error();
      }
    });
    return;
  }

  throw new Error();
};

const validateEntities = (entities: unknown, method: RestMethod) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entity) => {
      if (!ALLOWED_ENTITIES_BY_METHOD[method].includes(entity as any)) {
        throw new Error();
      }

      if (entity === 'headers' || entity === 'params') {
        const headersOrParams = entities[entity];
        return validateHeadersOrParams(headersOrParams);
      }

      if (entity === 'query') {
        const query = entities[entity];
        return validateQuery(query);
      }
    });
    return;
  }

  if (typeof entities !== 'undefined') {
    throw new Error();
  }
};

export const validateRoutes = (routes: unknown, method: RestMethod) => {
  const isRoutesArray = Array.isArray(routes);
  if (isRoutesArray) {
    routes.forEach((route) => {
      validateEntities(route.entities, method);
      validateInterceptors(route.interceptors);
    });
    return;
  }

  throw new Error();
};
