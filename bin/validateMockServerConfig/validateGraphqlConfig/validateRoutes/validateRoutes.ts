import {
  ALLOWED_CHECK_MODES,
  CHECK_ACTUAL_VALUE_CHECK_MODES,
  COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES
} from '@/utils/constants';
import { isPlainObject } from '@/utils/helpers';
import type {
  GraphQLEntityNamesByOperationType,
  GraphQLOperationType,
  GraphQLEntityName,
  CheckActualValueCheckMode,
  CompareWithExpectedValueCheckMode,
  CheckMode,
  GraphQLEntityDescriptor
} from '@/utils/types';

import { validateInterceptors } from '../../validateInterceptors/validateInterceptors';

type AllowedEntityNamesByOperationType = {
  [OperationType in keyof GraphQLEntityNamesByOperationType]: GraphQLEntityNamesByOperationType[OperationType][];
};
const ALLOWED_ENTITIES_BY_OPERATION_TYPE: AllowedEntityNamesByOperationType = {
  query: ['headers', 'cookies', 'query', 'variables'],
  mutation: ['headers', 'cookies', 'query', 'variables']
};

const isCheckModeValid = (checkMode: unknown) => ALLOWED_CHECK_MODES.includes(checkMode as CheckMode);

const isDescriptorValueValid = (entityName: unknown, checkMode: unknown, value: unknown) => {
  if (CHECK_ACTUAL_VALUE_CHECK_MODES.includes(checkMode as CheckActualValueCheckMode) && typeof value === 'undefined') return true;

  if (COMPARE_WITH_EXPECTED_VALUE_CHECK_MODES.includes(checkMode as CompareWithExpectedValueCheckMode)) {
    if (entityName === 'variables') {
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
      const { checkMode, value } = entitiesDescriptor as GraphQLEntityDescriptor<Exclude<GraphQLEntityName, 'variables'>>;
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

const validateVariablesEntity = (variables: unknown) => {
  const variablesDescriptor = variables && typeof variables === 'object' && 'checkMode' in variables ? variables : { checkMode: 'equals', value: variables };
  const { checkMode, value } = variablesDescriptor as GraphQLEntityDescriptor<'variables'>;
  if (!isCheckModeValid(checkMode)) {
    throw new Error('variables.checkMode');
  }

  if (!isDescriptorValueValid('variables', checkMode, value)) {
    throw new Error('variables.value');
  }
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

      try {
        if (entity === 'variables') {
          validateVariablesEntity(entities[entity]);
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
