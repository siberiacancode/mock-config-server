import { Request } from 'express';
import { ParsedQs } from 'qs';

import { Interceptors } from './interceptors';

export type PlainObject = Record<string, any>;
export type PlainFunction = (...args: any[]) => any;

export type BodyValue = any;
export type VariablesValue = any;
export type QueryValue = ParsedQs;
export type HeadersValue = Record<string, string | string[] | undefined>;
export type ParamsValue = Record<string, string | string[] | undefined>;
export type Data = boolean | number | string | any[] | Record<any, any> | null | undefined;

export type RestEntities = 'headers' | 'query' | 'params' | 'body';
export type RestEntitiesValue = BodyValue | QueryValue | HeadersValue | ParamsValue;

export type RestEntitiesValues = {
  [Key in RestEntities]: Key extends 'body'
    ? BodyValue
    : Key extends 'query'
    ? QueryValue
    : Key extends 'headers'
    ? HeadersValue
    : Key extends 'params'
    ? ParamsValue
    : never;
};

export interface RestMethodsEntities {
  get: Extract<RestEntities, 'headers' | 'query' | 'params'>;
  delete: Extract<RestEntities, 'headers' | 'query' | 'params'>;
  post: RestEntities;
  put: RestEntities;
  patch: RestEntities;
}

export type RestRouteConfigEntities<Method extends RestMethod> = {
  [Key in RestMethodsEntities[Method]]?: RestEntitiesValues[Key];
};

export interface RestRouteConfig<
  Method extends RestMethod,
  Entities extends RestRouteConfigEntities<Method> = RestRouteConfigEntities<Method>
> {
  entities?: Entities;
  data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch';

export interface BaseRestRequestConfig<Method extends RestMethod> {
  path: `/${string}` | RegExp;
  method: Method;
  routes: RestRouteConfig<Method>[];
  interceptors?: Interceptors;
}

export type RestGetRequestConfig = BaseRestRequestConfig<'get'>;
export type RestPostRequestConfig = BaseRestRequestConfig<'post'>;
export type RestPutRequestConfig = BaseRestRequestConfig<'put'>;
export type RestDeleteRequestConfig = BaseRestRequestConfig<'delete'>;
export type RestPatchRequestConfig = BaseRestRequestConfig<'patch'>;

export type RestRequestConfig =
  | RestGetRequestConfig
  | RestPostRequestConfig
  | RestPutRequestConfig
  | RestDeleteRequestConfig
  | RestPatchRequestConfig;

export type GraphQLEntities = 'headers' | 'query' | 'variables';

export type GraphQLEntitiesValues = {
  [Key in GraphQLEntities]: Key extends 'variables' ? VariablesValue : PlainObject;
};

export interface GraphQLOperationsEntities {
  query: GraphQLEntities;
  mutation: GraphQLEntities;
}

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;

export type GraphQLRouteConfigEntities = {
  [Key in GraphQLOperationsEntities[GraphQLOperationType]]?: GraphQLEntitiesValues[Key];
};

export interface GraphQLRouteConfig<
  Entities extends GraphQLRouteConfigEntities = GraphQLRouteConfigEntities
> {
  entities?: Entities;
  data: ((request: Request, entities: Entities) => Data | Promise<Data>) | Data;
  interceptors?: Pick<Interceptors, 'response'>;
}

export interface GraphQLQuery {
  operationType: GraphQLOperationType;
  operationName: GraphQLOperationName;
}

export interface GraphQLRequestConfig extends GraphQLQuery {
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}
