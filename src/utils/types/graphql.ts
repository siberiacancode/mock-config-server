import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { CheckFunction, CheckMode, CheckActualValueCheckMode, CompareWithExpectedValueCheckMode, Data } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';

export type GraphQLObjectEntityName = string;
export type GraphQLObjectEntityValue = string | number | boolean;

type GraphQLPlainEntityValue =
  // ✅ important: Omit `checkMode` key for fix types. Omit `call` key for exclude functions
  { checkMode?: undefined; call?: undefined; [key: string]: any };

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;

export interface GraphQLQuery {
  operationType: GraphQLOperationType;
  operationName: GraphQLOperationName;
}

export type GraphQLVariables = Record<string, any>;
export interface GraphQLInput {
  query?: string;
  variables: GraphQLVariables;
}

export type GraphQLEntityValue<EntityName = GraphQLEntityName> =
  EntityName extends 'variables'
    ? GraphQLPlainEntityValue
    : GraphQLObjectEntityValue;

export type GraphQLEntityDescriptor<
  EntityName extends GraphQLEntityName = GraphQLEntityName,
  Check extends CheckMode = CheckMode
> =
  Check extends 'function' ?
    {
      checkMode: Check;
      value: (actualValue: any, checkFunction: CheckFunction) => boolean;
    } :
    Check extends 'regExp' ?
      {
        checkMode: Check,
        value: RegExp | RegExp[];
      } :
      Check extends CompareWithExpectedValueCheckMode ?
        {
          checkMode: Check;
          value: GraphQLEntityValue<EntityName> | GraphQLEntityValue<EntityName>[];
        } :
        Check extends CheckActualValueCheckMode ?
          {
            checkMode: Check;
            value?: undefined;
          } :
          never;

export type GraphQLEntityDescriptorOrValue<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables'
    ? GraphQLEntityDescriptor<EntityName> | GraphQLEntityValue<EntityName>
    : Record<GraphQLObjectEntityName, GraphQLEntityDescriptor<EntityName> | GraphQLEntityValue<EntityName> | GraphQLEntityValue<EntityName>[]>

export type GraphQLEntityDescriptorOnly<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables'
    ? GraphQLEntityDescriptor<EntityName>
    : Record<GraphQLObjectEntityName, GraphQLEntityDescriptor<EntityName>>;

export interface GraphQLEntityNamesByOperationType {
  query: GraphQLEntityName;
  mutation: GraphQLEntityName;
}

export type GraphQLEntityByEntityName<OperationType extends GraphQLOperationType> = {
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
