import type { Interceptors } from './interceptors';

export type BodyValue = any;
export type QueryValue = Record<string, string | string[]>;
export type HeadersOrParamsValue = Record<string, string>;

export type RestEntities = 'headers' | 'query' | 'params' | 'body';
export type RestEntitiesValue = BodyValue | QueryValue | HeadersOrParamsValue;

export type RestEntitiesValues = {
  [Key in RestEntities]: Key extends 'body'
    ? BodyValue
    : Key extends 'query'
    ? QueryValue
    : Key extends 'headers' | 'params'
    ? HeadersOrParamsValue
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

export interface RestRouteConfig<Method extends RestMethod> {
  entities?: {
    [Key in RestMethodsEntities[Method]]?: RestEntitiesValues[Key];
  };
  data: any;
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
