import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { CheckFunction, CheckMode, CheckOneValueMode, CheckTwoValuesMode, Data } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';
export type GraphQLHeaderOrCookieOrQueryEntityValue = string | number | boolean;

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
  EntityName extends 'headers'
    ? GraphQLHeaderOrCookieOrQueryEntityValue
    : EntityName extends 'cookies'
      ? GraphQLHeaderOrCookieOrQueryEntityValue
      : EntityName extends 'query'
        ? GraphQLHeaderOrCookieOrQueryEntityValue
        : EntityName extends 'variables'
          ?
          | boolean
          | number
          | string
          | { checkMode?: undefined; [key: string]: any }
          | any[]
          | null
          | undefined
          : never;


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
      Check extends CheckTwoValuesMode ?
        {
          checkMode: Check;
          value: GraphQLEntityValue<EntityName> | GraphQLEntityValue<EntityName>[];
        } :
        Check extends CheckOneValueMode ?
          {
            checkMode: Check;
            value?: undefined;
          } :
          never;

export type GraphQLHeaderOrCookieOrQueryName = string;

export type GraphQLEntityDescriptorOrValue<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables'
    ? GraphQLEntityDescriptor<EntityName> | GraphQLEntityValue<EntityName>
    : Record<GraphQLHeaderOrCookieOrQueryName, GraphQLEntityDescriptor<EntityName> | GraphQLEntityValue<EntityName> | GraphQLEntityValue<EntityName>[]>


export type GraphQLHeadersEntity = Record<GraphQLHeaderOrCookieOrQueryName, GraphQLEntityDescriptor<'headers'>>;
export type GraphQLHeadersEntityDescriptorOrValue = GraphQLEntityDescriptorOrValue<'headers'>;

export type GraphQLCookiesEntity = Record<GraphQLHeaderOrCookieOrQueryName, GraphQLEntityDescriptor<'cookies'>>;
export type GraphQLCookiesEntityDescriptorOrValue = GraphQLEntityDescriptorOrValue<'cookies'>;

export type GraphQLQueryEntity = Record<GraphQLHeaderOrCookieOrQueryName, GraphQLEntityDescriptor<'query'>>;
export type GraphQLQueryEntityDescriptorOrValue = GraphQLEntityDescriptorOrValue<'query'>;

export type GraphQLVariablesEntity = GraphQLEntityDescriptor<'variables'>;
export type GraphQLVariablesEntityDescriptorOrValue = GraphQLEntityDescriptorOrValue<'variables'>;

export type GraphQLEntityDescriptorOnly<EntityName = GraphQLEntityName> =
  EntityName extends 'headers'
    ? GraphQLHeadersEntity
    : EntityName extends 'cookies'
      ? GraphQLCookiesEntity
      : EntityName extends 'query'
        ? GraphQLQueryEntity
        : EntityName extends 'variables'
          ? GraphQLVariablesEntity
          : never;

export type GraphQLEntity<EntityName = GraphQLEntityName> =
  EntityName extends 'headers'
    ? GraphQLHeadersEntityDescriptorOrValue
    : EntityName extends 'cookies'
      ? GraphQLCookiesEntityDescriptorOrValue
      : EntityName extends 'query'
        ? GraphQLQueryEntityDescriptorOrValue
        : EntityName extends 'variables'
          ? GraphQLVariablesEntityDescriptorOrValue
          : never;

export type GraphQLEntityByName = {
  [EntityName in GraphQLEntityName]: GraphQLEntity<EntityName>;
};

export type GraphQLEntityNameByOperationType<OperationTypes extends GraphQLOperationType = GraphQLOperationType> = {
  [OperationType in OperationTypes]: GraphQLEntityName;
}


export type GraphQLRouteConfigEntities = {
  [EntityName in GraphQLEntityNameByOperationType[GraphQLOperationType]]?: GraphQLEntityByName[EntityName];
};

export interface GraphQLRouteConfig<
  Entities extends GraphQLRouteConfigEntities = GraphQLRouteConfigEntities
> {
  entities?: Entities;
  data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export interface GraphQLRequestConfig extends GraphQLQuery {
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}
