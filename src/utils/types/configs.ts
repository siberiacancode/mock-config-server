export type PlainObject = Record<string, string | number>;
export type PlainFunction = (...args: any[]) => any;

export type Entities = 'headers' | 'query' | 'params' | 'body';
export type BodyValue = any;

export type EntitiesValues = {
  [Key in Entities]: Key extends 'body' ? BodyValue : PlainObject;
};

export interface HttpMethodsEntities {
  get: Extract<Entities, 'headers' | 'query' | 'params'>;
  delete: Extract<Entities, 'headers' | 'query' | 'params'>;
  post: Entities;
  put: Entities;
  patch: Entities;
}

export interface RouteConfig<Method extends RestMethod> {
  entities?: {
    [Key in HttpMethodsEntities[Method]]?: EntitiesValues[Key];
  };
  data: any;
  interceptors?: Pick<import('./interceptors').Interceptors, 'response'>;
}

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch';
export interface RestRequestConfig<Method extends RestMethod> {
  path: string | RegExp;
  method: Method;
  routes: RouteConfig<Method>[];
  interceptors?: import('./interceptors').Interceptors;
}

export type RestGetRequestConfig = RestRequestConfig<'get'>;
export type RestPostRequestConfig = RestRequestConfig<'post'>;
export type RestPutRequestConfig = RestRequestConfig<'put'>;
export type RestDeleteRequestConfig = RestRequestConfig<'delete'>;
export type RestPatchRequestConfig = RestRequestConfig<'patch'>;

export type RequestConfig =
  | RestGetRequestConfig
  | RestPostRequestConfig
  | RestPutRequestConfig
  | RestDeleteRequestConfig
  | RestPatchRequestConfig;
