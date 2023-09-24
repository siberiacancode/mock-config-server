import { convertToEntityDescriptor, isEntityDescriptor, isPlainObject } from '@/utils/helpers';
import type { RestMethod, RestEntityNamesByMethod, RestEntityName } from '@/utils/types';

import { isCheckModeValid, isDescriptorValueValid } from '../../helpers';
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

const validateEntity = (entity: unknown, entityName: RestEntityName) => {
  const isBody = entityName === 'body';
  const isTopLevelDescriptor = isEntityDescriptor(entity);
  if (isTopLevelDescriptor && isBody) {
    if (!isCheckModeValid(entity.checkMode, 'body')) {
      throw new Error('body.checkMode');
    }

    if (!isDescriptorValueValid(entity.checkMode, entity.value, true)) {
      throw new Error('body.value');
    }
  }

  const isEntityObject = isPlainObject(entity);
  const isEntityBodyArray = Array.isArray(entity) && isBody;
  if (isEntityObject || isEntityBodyArray) {
    Object.entries(entity).forEach(([key, valueOrDescriptor]) => {
      const { checkMode, value } = convertToEntityDescriptor(valueOrDescriptor);
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entityName}.${key}.checkMode`);
      }

      const isDescriptor = isEntityDescriptor(valueOrDescriptor);
      const errorMessage = `${entityName}.${key}${isDescriptor ? '.value' : ''}`;

      const isValueArray = Array.isArray(value);
      if (isValueArray && !isBody) {
        value.forEach((element, index) => {
          if (
            isBody &&
            !isDescriptorValueValid(checkMode, element, true) &&
            !isDescriptorValueValid(checkMode, element, false)
          ) {
            throw new Error(`${errorMessage}[${index}]`);
          } else if (!isDescriptorValueValid(checkMode, element, false)) {
            throw new Error(`${errorMessage}[${index}]`);
          }
        });
        return;
      }

      if (
        isBody &&
        !isDescriptorValueValid(checkMode, value, true) &&
        !isDescriptorValueValid(checkMode, value, false)
      ) {
        throw new Error(errorMessage);
      } else if (!isDescriptorValueValid(checkMode, value, false)) {
        throw new Error(errorMessage);
      }
    });
    return;
  }

  throw new Error(entityName);
};

const validateEntities = (entities: unknown, method: RestMethod) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entityName) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_METHOD[method].includes(entityName as any);
      if (!isEntityAllowed) {
        throw new Error(`entities.${entityName}`);
      }

      try {
        validateEntity(entities[entityName], entityName as RestEntityName);
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
