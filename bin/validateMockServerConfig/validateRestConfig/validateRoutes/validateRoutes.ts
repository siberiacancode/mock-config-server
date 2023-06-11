import {
  ALLOWED_CHECK_MODES,
  ONE_VALUE_CHECK_MODES,
  TWO_VALUES_CHECK_MODES
} from '@/utils/constants';
import { isPlainObject } from '@/utils/helpers';
import type {
  RestMethod,
  RestEntityNameByMethod,
  RestEntityName,
  RestEntity,
  CheckOneValueMode,
  CheckTwoValuesMode,
  CheckMode
} from '@/utils/types';

import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByMethod = {
  [Method in keyof RestEntityNameByMethod]: RestEntityNameByMethod[Method][];
};
const ALLOWED_ENTITIES_BY_METHOD: AllowedEntitiesByMethod = {
  get: ['headers', 'cookies', 'query', 'params'],
  delete: ['headers', 'cookies', 'query', 'params'],
  post: ['headers', 'cookies', 'query', 'params', 'body'],
  put: ['headers', 'cookies', 'query', 'params', 'body'],
  patch: ['headers', 'cookies', 'query', 'params', 'body'],
  options: ['headers', 'cookies', 'query', 'params']
};

export const isCheckModeValid = (checkMode: unknown) => ALLOWED_CHECK_MODES.includes(checkMode as CheckMode);

const isHeadersOrCookiesOrQueryOrParamsDescriptorValid = (checkMode: unknown, value: unknown) => {
  if (ONE_VALUE_CHECK_MODES.includes(checkMode as CheckOneValueMode) && typeof value === 'undefined') return true;
  if (
    TWO_VALUES_CHECK_MODES.includes(checkMode as CheckTwoValuesMode) && (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    )
  ) return true;

  if (checkMode === 'function' && typeof value === 'function') return true;
  if (checkMode === 'regExp' && (value instanceof RegExp)) return true;

  return false;
}

const validateHeadersOrCookiesOrQueryOrParams = (headersOrCookiesOrQueryOrParams: unknown, entity: string) => {
  const isHeadersOrCookiesOrQueryOrParamsObject = isPlainObject(headersOrCookiesOrQueryOrParams);
  if (isHeadersOrCookiesOrQueryOrParamsObject) {
    Object.entries(headersOrCookiesOrQueryOrParams).forEach(([headerOrCookieOrQueryOrParamKey, headerOrCookieOrQueryOrParamDescriptor]) => {
      const { checkMode, value } = headerOrCookieOrQueryOrParamDescriptor as RestEntity<Exclude<RestEntityName, 'body'>>;
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entity}.${headerOrCookieOrQueryOrParamKey}.checkMode`);
      }
      const isValueArray = Array.isArray(value);
      if (isValueArray) {
        value.forEach((element, index) => {
          if (!isHeadersOrCookiesOrQueryOrParamsDescriptorValid(checkMode, element)) {
            throw new Error(`${entity}.${headerOrCookieOrQueryOrParamKey}.value[${index}]`);
          }
        })
        return;
      }
      if (!isHeadersOrCookiesOrQueryOrParamsDescriptorValid(checkMode, value)) {
        throw new Error(`${entity}.${headerOrCookieOrQueryOrParamKey}.value`);
      }
    });
    return;
  }

  throw new Error(entity);
};

const validateEntities = (entities: unknown, method: RestMethod) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entityName) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_METHOD[method].includes(entityName as any);
      if (!isEntityAllowed) {
        throw new Error(`entities.${entityName}`);
      }

      if (
        entityName === 'headers' ||
        entityName === 'cookies' ||
        entityName === 'query' ||
        entityName === 'params'
      ) {
        try {
          const headersOrCookiesOrQueryOrParams = entities[entityName];
          validateHeadersOrCookiesOrQueryOrParams(headersOrCookiesOrQueryOrParams, entityName);
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
