import type { Request } from 'express';

import type {
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { Interceptors } from './interceptors';
import type { NestedObjectOrArray } from './utils';
import type { Data } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';

type GraphQLPlainEntityValue = string | number | boolean | null;
type GraphQLMappedEntityValue = string | number | boolean;

export type GraphQLTopLevelPlainEntityDescriptor<Check extends CheckMode = CheckMode> =
  Check extends 'function'
    ? {
        checkMode: Check;
        value: (
          actualValue: NestedObjectOrArray<GraphQLPlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: NestedObjectOrArray<GraphQLPlainEntityValue>;
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
        value: (
          actualValue: GraphQLPlainEntityValue | NestedObjectOrArray<GraphQLPlainEntityValue>,
          checkFunction: CheckFunction
        ) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: GraphQLPlainEntityValue | NestedObjectOrArray<GraphQLPlainEntityValue>;
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
      value: GraphQLMappedEntityValue | GraphQLMappedEntityValue[];
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
      value: never;
    }
  : never;

export type GraphQLEntityDescriptorOrValue<
  EntityName extends GraphQLEntityName = GraphQLEntityName
> = EntityName extends 'variables'
  ?
      | GraphQLTopLevelPlainEntityDescriptor
      | Record<string, GraphQLPropertyLevelPlainEntityDescriptor>
      | NestedObjectOrArray<GraphQLPlainEntityValue>
  : Record<
      string,
      GraphQLMappedEntityDescriptor | GraphQLMappedEntityValue | GraphQLMappedEntityValue[]
    >;

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;
export type GraphQLEntityNamesByOperationType = {
  [operationType in GraphQLOperationType]: GraphQLEntityName;
};

export type GraphQLEntitiesByEntityName = {
  [EntityName in GraphQLEntityName]?: GraphQLEntityDescriptorOrValue<EntityName>;
};
export interface GraphQLRouteConfig {
  data: ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>) | Data;
  entities?: GraphQLEntitiesByEntityName;
  interceptors?: Pick<Interceptors, 'response'>;
}

interface BaseGraphQLRequestConfig {
  operationType: GraphQLOperationType;
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}

export interface OperationNameGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  operationName: GraphQLOperationName;
}

interface QueryGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  query: string;
}

export type GraphQLRequestConfig = OperationNameGraphQLRequestConfig | QueryGraphQLRequestConfig;
