import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { BodyValue, Data, HeadersValue, ParamsValue, QueryValue } from './values';

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
  options: Extract<RestEntities, 'headers' | 'query' | 'params'>;
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

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch' | 'options';

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
export type RestOptionsRequestConfig = BaseRestRequestConfig<'options'>;

export type RestRequestConfig =
  | RestGetRequestConfig
  | RestPostRequestConfig
  | RestPutRequestConfig
  | RestDeleteRequestConfig
  | RestPatchRequestConfig
  | RestOptionsRequestConfig;
