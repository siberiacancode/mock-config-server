import type { Request } from 'express';

import type {
  CalculateByDescriptorValueCheckMode,
  CheckActualValueCheckMode,
  CheckFunction,
  CheckMode,
  CompareWithDescriptorAnyValueCheckMode,
  CompareWithDescriptorValueCheckMode
} from './checkModes';
import type { Interceptors } from './interceptors';
import type { Data, Primitive } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';

export type GraphQLMappedEntityName = string;
type GraphQLMappedEntityValue = string | number | boolean;

type GraphQLPlainEntityInnerValue = {
  checkMode?: undefined;
  call?: undefined;
  dotAll?: undefined;
  [key: string]: Primitive | GraphQLPlainEntityInnerValue;
};

type GraphQLPlainEntityValue =
  // ✅ important:
  // Omit `checkMode` key for fix types,
  // Omit `call` key for exclude functions,
  // Omit `forEach` for exclude arrays,
  // Omit `dotAll` for exclude RegExp.
  {
    checkMode?: undefined;
    call?: undefined;
    forEach?: undefined;
    dotAll?: undefined;
    [key: string]: GraphQLPlainEntityInnerValue | Primitive | GraphQLEntityDescriptor;
  };

export type GraphQLOperationType = 'query' | 'mutation';
type GraphQLOperationName = string | RegExp;

interface GraphQLQuery {
  operationType: GraphQLOperationType;
  operationName: GraphQLOperationName;
}

type GraphQLVariables = Record<string, any>;
export interface GraphQLInput {
  query?: string;
  variables: GraphQLVariables;
}

type GraphQLEntityValue<EntityName = GraphQLEntityName> = EntityName extends 'variables'
  ? GraphQLPlainEntityValue
  : GraphQLMappedEntityValue;

type GraphQLEntityValueOrValues<EntityName = GraphQLEntityName> =
  | GraphQLEntityValue<EntityName>
  | GraphQLEntityValue<EntityName>[];

type GraphQLEntityDescriptor<
  EntityName extends GraphQLEntityName = GraphQLEntityName,
  Check extends CheckMode = CheckMode
> = EntityName extends 'variables'
  ? Check extends Extract<CalculateByDescriptorValueCheckMode, 'function'>
    ? {
        checkMode: Check;
        value: (actualValue: any, checkFunction: CheckFunction) => boolean;
      }
    : Check extends CompareWithDescriptorAnyValueCheckMode
    ? {
        checkMode: Check;
        value: GraphQLEntityValueOrValues<EntityName>;
      }
    : Check extends CheckActualValueCheckMode
    ? {
        checkMode: Check;
        value?: undefined;
      }
    : never
  : Check extends Extract<CalculateByDescriptorValueCheckMode, 'function'>
  ? {
      checkMode: Check;
      value: (actualValue: any, checkFunction: CheckFunction) => boolean;
    }
  : Check extends Extract<CalculateByDescriptorValueCheckMode, 'regExp'>
  ? {
      checkMode: Check;
      value: RegExp | RegExp[];
    }
  : Check extends CompareWithDescriptorValueCheckMode
  ? {
      checkMode: Check;
      value: GraphQLEntityValueOrValues<EntityName>;
    }
  : Check extends CheckActualValueCheckMode
  ? {
      checkMode: Check;
      value?: undefined;
    }
  : never;

export type GraphQLEntityDescriptorOrValue<
  EntityName extends GraphQLEntityName = GraphQLEntityName
> = EntityName extends 'variables'
  ? GraphQLEntityDescriptor<EntityName> | GraphQLEntityValue<EntityName>
  : Record<
      GraphQLMappedEntityName,
      GraphQLEntityDescriptor<EntityName> | GraphQLEntityValueOrValues<EntityName>
    >;

export type GraphQLEntityDescriptorOnly<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables'
    ? GraphQLEntityDescriptor<EntityName>
    : Record<GraphQLMappedEntityName, GraphQLEntityDescriptor<EntityName>>;

export interface GraphQLEntityNamesByOperationType {
  query: GraphQLEntityName;
  mutation: GraphQLEntityName;
}

type GraphQLEntityByEntityName<OperationType extends GraphQLOperationType> = {
  [EntityName in GraphQLEntityNamesByOperationType[OperationType]]?: GraphQLEntityDescriptorOrValue<EntityName>;
};

export interface GraphQLRouteConfig<
  OperationType extends GraphQLOperationType = GraphQLOperationType,
  Entities extends GraphQLEntityByEntityName<OperationType> = GraphQLEntityByEntityName<OperationType>
> {
  entities?: Entities;
  data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export interface GraphQLRequestConfig extends GraphQLQuery {
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}
