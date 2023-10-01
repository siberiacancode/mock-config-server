import { convertToEntityDescriptor, isEntityDescriptor, isPlainObject } from '@/utils/helpers';
import type {
  GraphQLEntityName,
  GraphQLEntityNamesByOperationType,
  GraphQLOperationType
} from '@/utils/types';

import { isCheckModeValid, isDescriptorValueValid } from '../../helpers';
import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntityNamesByOperationType = {
  [OperationType in keyof GraphQLEntityNamesByOperationType]: GraphQLEntityNamesByOperationType[OperationType][];
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntityNamesByOperationType = {
  query: ['headers', 'cookies', 'query', 'variables'],
  mutation: ['headers', 'cookies', 'query', 'variables']
};

const validateEntity = (entity: unknown, entityName: GraphQLEntityName) => {
  const isVariables = entityName === 'variables';
  const isTopLevelDescriptor = isEntityDescriptor(entity);
  if (isTopLevelDescriptor && isVariables) {
    if (!isCheckModeValid(entity.checkMode, 'variables')) {
      throw new Error('variables.checkMode');
    }

    if (!isDescriptorValueValid(entity.checkMode, entity.value, true)) {
      throw new Error('variables.value');
    }

    return;
  }

  const isEntityObject = isPlainObject(entity);
  const isEntityVariablesArray = Array.isArray(entity) && isVariables;
  if (isEntityObject || isEntityVariablesArray) {
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
          if (
            isVariables &&
            !isDescriptorValueValid(checkMode, element, true) &&
            !isDescriptorValueValid(checkMode, element, false)
          ) {
            throw new Error(`${errorMessage}[${index}]`);
          }
          if (!isVariables && !isDescriptorValueValid(checkMode, element, false)) {
            throw new Error(`${errorMessage}[${index}]`);
          }
        });
        return;
      }

      if (
        isVariables &&
        !isDescriptorValueValid(checkMode, value, true) &&
        !isDescriptorValueValid(checkMode, value, false)
      ) {
        throw new Error(errorMessage);
      }
      if (!isVariables && !isDescriptorValueValid(checkMode, value, false)) {
        throw new Error(errorMessage);
      }
    });
    return;
  }

  throw new Error(entityName);
};

const validateEntities = (entities: unknown, operationType: GraphQLOperationType) => {
  const isEntitiesObject = isPlainObject(entities);
  if (isEntitiesObject) {
    Object.keys(entities).forEach((entityName) => {
      const isEntityAllowed = ALLOWED_ENTITIES_BY_OPERATION_TYPE[operationType].includes(
        entityName as any
      );
      if (!isEntityAllowed) {
        throw new Error(`entities.${entityName}`);
      }

      try {
        validateEntity(entities[entityName], entityName as GraphQLEntityName);
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
