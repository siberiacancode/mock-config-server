import { convertToEntityDescriptor, isEntityDescriptor, isPlainObject } from '@/utils/helpers';
import type { RestEntityNamesByMethod, RestMethod } from '@/utils/types';

import { isCheckModeValid, isDescriptorValueValid } from '../../helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';
import { validateSettings } from '../../validateSettings/validateSettings';

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

const validateEntity = (entity: unknown, entityName: string) => {
  const { checkMode: topLevelCheckMode, value: topLevelValue } = convertToEntityDescriptor(entity);
  const isBody = entityName === 'body';

  const isTopLevelDescriptor = isEntityDescriptor(entity);
  if (isTopLevelDescriptor && isBody) {
    if (!isCheckModeValid(topLevelCheckMode, 'body')) {
      throw new Error('body.checkMode');
    }

    if (!isDescriptorValueValid(topLevelCheckMode, topLevelValue, 'body')) {
      const errorMessage = 'body.value';
      throw new Error(errorMessage);
    }
  }

  const isEntityObject = isPlainObject(entity) && !(entity instanceof RegExp);
  const isEntityArray = Array.isArray(entity) && isBody;
  if (isEntityObject || isEntityArray) {
    Object.entries(topLevelValue).forEach(([key, valueOrDescriptor]) => {
      const { checkMode, value } = convertToEntityDescriptor(valueOrDescriptor);
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entityName}.${key}.checkMode`);
      }

      const isDescriptor = isEntityDescriptor(valueOrDescriptor);
      const errorMessage = `${entityName}.${key}${isDescriptor ? '.value' : ''}`;

      const isValueArray = Array.isArray(value);
      if (isValueArray && !isBody) {
        value.forEach((element, index) => {
          if (!isDescriptorValueValid(checkMode, element)) {
            throw new Error(`${errorMessage}[${index}]`);
          }
        });
        return;
      }
      if (!isDescriptorValueValid(checkMode, value)) {
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
        validateEntity(entities[entityName], entityName);
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
        const isRouteHasQueueProperty = 'queue' in route;

        if (!isRouteHasDataProperty && !isRouteHasQueueProperty) {
          throw new Error(`routes[${index}]`);
        }

        const { settings } = route;
        const isRouteSettingsObject = isPlainObject(settings);
        const isRouteQueueArray = Array.isArray(route.queue);

        if (
          isRouteHasQueueProperty &&
          (!(isRouteSettingsObject && settings?.polling) || !isRouteQueueArray)
        ) {
          throw new Error(`routes[${index}]`);
        }

        if (isRouteHasDataProperty && isRouteSettingsObject && settings?.polling) {
          throw new Error(`routes[${index}]`);
        }

        try {
          validateSettings(route.settings);
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
