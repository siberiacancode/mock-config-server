import type { Request } from 'express';

import type {
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { Interceptors } from './interceptors';
import type { NestedObject } from './utils';
import type { Data, Primitive } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';
type GraphQLPlainEntityName = Extract<GraphQLEntityName, 'variables'>;
type GraphQLMappedEntityName = Exclude<GraphQLEntityName, 'variables'>;

type GraphQLPlainEntityValue = Primitive;
type GraphQLMappedEntityValue = string | number | boolean;

type GraphQLEntityValue<EntityName extends GraphQLEntityName> =
  EntityName extends GraphQLPlainEntityName ? GraphQLPlainEntityValue : GraphQLMappedEntityValue;
export type GraphQLEntityValueOrValues<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  | GraphQLEntityValue<EntityName>
  | GraphQLEntityValue<EntityName>[];

export type GraphQLTopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (actualValue: NestedObject<Primitive>, checkFunction: CheckFunction) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: Record<string, GraphQLPlainEntityValue> | Record<string, GraphQLPlainEntityValue>[];
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value: never;
      }
    : never;

type GraphQLPropertyLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (actualValue: GraphQLPlainEntityValue, checkFunction: CheckFunction) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: GraphQLEntityValueOrValues<GraphQLPlainEntityName>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value: never;
      }
    : never;

type GraphQLMappedEntityDescriptor<Check extends CheckMode = CheckMode> = Check extends 'function'
  ? {
      checkMode: Check;
      value: (actualValue: GraphQLMappedEntityValue, checkFunction: CheckFunction) => boolean;
    }
  : Check extends 'regExp'
  ? {
      checkMode: Check;
      value: RegExp | RegExp[];
    }
  : Check extends CompareWithDescriptorValueCheckMode
  ? {
      checkMode: Check;
      value: GraphQLEntityValueOrValues<GraphQLMappedEntityName>;
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
      value: never;
    }
  : never;

export type GraphQLEntityDescriptorOrValue<
  EntityName extends GraphQLEntityName = GraphQLEntityName
> = EntityName extends GraphQLPlainEntityName
  ?
      | GraphQLTopLevelPlainEntityDescriptor
      | Record<
          string,
          GraphQLPropertyLevelPlainEntityDescriptor | GraphQLEntityValueOrValues<EntityName>
        >
  : Record<string, GraphQLMappedEntityDescriptor | GraphQLEntityValueOrValues<EntityName>>;

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;
export type GraphQLEntityNamesByOperationType = {
  [operationType in GraphQLOperationType]: GraphQLEntityName;
};

export type GraphQLEntitiesByEntityName = {
  [EntityName in GraphQLEntityName]?: GraphQLEntityDescriptorOrValue<EntityName>;
};
export interface GraphQLRouteConfig {
  entities?: GraphQLEntitiesByEntityName;
  data: ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export interface GraphQLRequestConfig {
  operationType: GraphQLOperationType;
  operationName: GraphQLOperationName;
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}
