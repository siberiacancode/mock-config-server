import {
  ALLOWED_CHECK_MODES,
  ONE_VALUE_CHECK_MODES,
  TWO_VALUES_CHECK_MODES
} from '@/utils/constants';
import { isPlainObject } from '@/utils/helpers';
import type {
  GraphQLEntityNameByOperationType,
  GraphQLOperationType,
  GraphQLEntity,
  GraphQLEntityName,
  CheckOneValueMode,
  CheckTwoValuesMode,
  CheckMode
} from '@/utils/types';

import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntitiesByOperationType = {
  [OperationType in keyof GraphQLEntityNameByOperationType]: GraphQLEntityNameByOperationType[OperationType][];
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntitiesByOperationType = {
  query: ['headers', 'cookies', 'query', 'variables'],
  mutation: ['headers', 'cookies', 'query', 'variables']
};



export const isCheckModeValid = (checkMode: unknown) => ALLOWED_CHECK_MODES.includes(checkMode as CheckMode);

const isHeadersOrCookiesOrQueryDescriptorValid = (checkMode: unknown, value: unknown) => {
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

const validateHeadersOrCookiesOrQuery = (headersOrCookiesOrQuery: unknown, entity: string) => {
  const isHeadersOrCookiesOrQueryObject = isPlainObject(headersOrCookiesOrQuery);
  if (isHeadersOrCookiesOrQueryObject) {
    Object.entries(headersOrCookiesOrQuery).forEach(([headerOrCookieOrQueryKey, headerOrCookieOrQueryDescriptor]) => {
      const { checkMode, value } = headerOrCookieOrQueryDescriptor as GraphQLEntity<Exclude<GraphQLEntityName, 'variables'>>;
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entity}.${headerOrCookieOrQueryKey}.checkMode`);
      }
      const isValueArray = Array.isArray(value);
      if (isValueArray) {
        value.forEach((element, index) => {
          if (!isHeadersOrCookiesOrQueryDescriptorValid(checkMode, element)) {
            throw new Error(`${entity}.${headerOrCookieOrQueryKey}.value[${index}]`);
          }
        })
        return;
      }
      if (!isHeadersOrCookiesOrQueryDescriptorValid(checkMode, value)) {
        throw new Error(`${entity}.${headerOrCookieOrQueryKey}.value`);
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
