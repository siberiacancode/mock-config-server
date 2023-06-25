import {
  ALLOWED_CHECK_MODES,
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES
} from '@/utils/constants';
import { isPlainObject } from '@/utils/helpers';
import type {
  RestMethod,
  RestEntityNamesByMethod,
  RestEntityName,
  RestEntityDescriptor,
  CheckActualValueCheckMode,
  CompareWithExpectedValueCheckMode,
  CheckMode
} from '@/utils/types';

import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntityNamesByMethod = {
  [Method in keyof RestEntityNamesByMethod]: RestEntityNamesByMethod[Method][];
};
const ALLOWED_ENTITIES_BY_METHOD: AllowedEntityNamesByMethod = {
  get: ['headers', 'cookies', 'query', 'params'],
  delete: ['headers', 'cookies', 'query', 'params'],
  post: ['headers', 'cookies', 'query', 'params', 'body'],
  put: ['headers', 'cookies', 'query', 'params', 'body'],
  patch: ['headers', 'cookies', 'query', 'params', 'body'],
  options: ['headers', 'cookies', 'query', 'params']
};

const isCheckModeValid = (checkMode: unknown) => ALLOWED_CHECK_MODES.includes(checkMode as CheckMode);

const isDescriptorValueValid = (entityName: unknown, checkMode: unknown, value: unknown) => {
  if (CHECK_ACTUAL_VALUE_CHECK_MODES.includes(checkMode as CheckActualValueCheckMode) && typeof value === 'undefined') return true;

  if (COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES.includes(checkMode as CompareWithExpectedValueCheckMode)) {
    if (entityName === 'body') {
      if ((
          typeof value === 'boolean' ||
          typeof value === 'number' ||
          typeof value === 'string' ||
          typeof value === 'object'
        ) &&
        value !== null &&
        typeof value !== 'function' &&
        !(value instanceof RegExp)
      ) return true;
    }
    if (
      typeof value === 'boolean' ||
      typeof value === 'number' ||
      typeof value === 'string'
    ) return true;
  }

  if (checkMode === 'function' && typeof value === 'function') return true;
  if (checkMode === 'regExp' && (value instanceof RegExp)) return true;

  return false;
}

const validateObjectEntity = (objectEntity: unknown, entityName: string) => {
  const isEntityObject = isPlainObject(objectEntity);
  if (isEntityObject) {
    Object.entries(objectEntity).forEach(([key, descriptor]) => {
      const entitiesDescriptor = descriptor && typeof descriptor === 'object' && 'checkMode' in descriptor ? descriptor : { checkMode: 'equals', value: descriptor };
      const { checkMode, value } = entitiesDescriptor as RestEntityDescriptor<Exclude<RestEntityName, 'body'>>;
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entityName}.${key}.checkMode`);
      }
      const isValueArray = Array.isArray(value);
      if (isValueArray) {
        value.forEach((element, index) => {
          if (!isDescriptorValueValid(entityName, checkMode, element)) {
            throw new Error(`${entityName}.${key}.value[${index}]`);
          }
        })
        return;
      }
      if (!isDescriptorValueValid(entityName, checkMode, value)) {
        throw new Error(`${entityName}.${key}.value`);
      }
    });
    return;
  }

  throw new Error(entityName);
};

const validateBodyEntity = (body: unknown) => {
  const bodyDescriptor = body && typeof body === 'object' && 'checkMode' in body ? body : { checkMode: 'equals', value: body };
  const { checkMode, value } = bodyDescriptor as RestEntityDescriptor<'body'>;
  if (!isCheckModeValid(checkMode)) {
    throw new Error('body.checkMode');
  }

  if (!isDescriptorValueValid('body', checkMode, value)) {
    throw new Error('body.value');
  }
};

const validateEntities = (entities: unknown, method: RestMethod) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entity) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_METHOD[method].includes(entity as any);
      if (!isEntityAllowed) {
        throw new Error(`entities.${entity}`);
      }

      try {
        if (entity === 'body') {
          validateBodyEntity(entities[entity]);
        } else {
          validateObjectEntity(entities[entity], entity);
        }
      } catch (error: any) {
        throw new Error(`entities.${error.message}`);
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
