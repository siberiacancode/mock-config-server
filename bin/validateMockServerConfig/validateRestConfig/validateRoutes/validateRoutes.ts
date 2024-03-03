import { convertToEntityDescriptor, isEntityDescriptor, isPlainObject } from '@/utils/helpers';
import type { RestEntityName, RestEntityNamesByMethod, RestMethod } from '@/utils/types';

import { isCheckModeValid, isDescriptorValueValid } from '../../helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';
import { validateQueue } from '../../validateQueue/validateQueue';
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

const validateEntity = (entity: unknown, entityName: RestEntityName) => {
  const isBody = entityName === 'body';

  const isEntityTopLevelDescriptor = isEntityDescriptor(entity);
  if (isEntityTopLevelDescriptor) {
    if (!isBody) {
      throw new Error(entityName);
    }

    if (!isCheckModeValid(entity.checkMode, 'body')) {
      throw new Error('body.checkMode');
    }

    const isDescriptorValueObjectOrArray =
      isPlainObject(entity.value) || Array.isArray(entity.value);
    if (
      !isDescriptorValueObjectOrArray ||
      !isDescriptorValueValid(entity.checkMode, entity.value)
    ) {
      throw new Error('body.value');
    }

    return;
  }

  const isEntityArray = Array.isArray(entity);
  if (isEntityArray) {
    if (!isBody) {
      throw new Error(entityName);
    }

    entity.forEach((entityElement, index) => {
      const isEntityElementObjectOrArray =
        isPlainObject(entityElement) || Array.isArray(entityElement);
      if (!isEntityElementObjectOrArray || !isDescriptorValueValid('equals', entityElement)) {
        throw new Error(`${entityName}[${index}]`);
      }
    });

    return;
  }

  const isEntityObject = isPlainObject(entity);
  if (isEntityObject) {
    Object.entries(entity).forEach(([key, valueOrDescriptor]) => {
      const { checkMode, value } = convertToEntityDescriptor(valueOrDescriptor);
      if (!isCheckModeValid(checkMode)) {
        throw new Error(`${entityName}.${key}.checkMode`);
      }

      const isDescriptor = isEntityDescriptor(valueOrDescriptor);
      const errorMessage = `${entityName}.${key}${isDescriptor ? '.value' : ''}`;

      const isValueArray = Array.isArray(value);
      if (isValueArray) {
        value.forEach((element, index) => {
          if (isBody) {
            if (isDescriptorValueValid(checkMode, element)) return;
            throw new Error(`${errorMessage}[${index}]`);
          }

          const isElementObjectOrArray = isPlainObject(element) || Array.isArray(element);
          if (isElementObjectOrArray || !isDescriptorValueValid(checkMode, element)) {
            throw new Error(`${errorMessage}[${index}]`);
          }
        });
        return;
      }

      if (isBody) {
        if (isDescriptorValueValid(checkMode, value)) return;
        throw new Error(errorMessage);
      }

      const isValueObject = isPlainObject(value);
      if (isValueObject || !isDescriptorValueValid(checkMode, value)) {
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
        const isRouteHasFileProperty = 'file' in route;
        const isRouteHasDataProperty = 'data' in route;
        const isRouteHasQueueProperty = 'queue' in route;

        const dataResolvingPropertiesCount =
          Number(isRouteHasFileProperty) +
          Number(isRouteHasDataProperty) +
          Number(isRouteHasQueueProperty);
        if (dataResolvingPropertiesCount !== 1) {
          throw new Error(`routes[${index}]`);
        }

        const { settings } = route;
        const isRouteSettingsObject = isPlainObject(settings);

        if (isRouteHasQueueProperty) {
          try {
            validateQueue(route.queue);

            if (!isRouteSettingsObject) {
              throw new Error('settings');
            }

            if (!(isRouteSettingsObject && settings?.polling)) {
              throw new Error('settings.polling');
            }
          } catch (error: any) {
            throw new Error(`routes[${index}].${error.message}`);
          }
        }

        if (isRouteHasFileProperty) {
          if (typeof route.file !== 'string') {
            throw new Error(`routes[${index}].file`);
          }

          if (isRouteSettingsObject && settings.polling) {
            throw new Error(`routes[${index}].settings.polling`);
          }
        }

        if (isRouteHasDataProperty && isRouteSettingsObject && settings.polling) {
          throw new Error(`routes[${index}].settings.polling`);
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
