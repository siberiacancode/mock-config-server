export type PlainObject = Record<string, string | number>;
export type PlainFunction = (...args: any[]) => any;
export type BodyValue = any;
export type VariablesValue = any;

export type RestEntities = 'headers' | 'query' | 'params' | 'body';

export type RestEntitiesValues = {
  [Key in RestEntities]: Key extends 'body' ? BodyValue : PlainObject;
};

export interface RestMethodsEntities {
  get: Extract<RestEntities, 'headers' | 'query' | 'params'>;
  delete: Extract<RestEntities, 'headers' | 'query' | 'params'>;
  post: RestEntities;
  put: RestEntities;
  patch: RestEntities;
}

export interface RestRouteConfig<Method extends RestMethod> {
  entities?: {
    [Key in RestMethodsEntities[Method]]?: RestEntitiesValues[Key];
  };
  data: any;
  interceptors?: Pick<import('./interceptors').Interceptors, 'response'>;
}

export type RestMethod = 'get' | 'post' | 'delete' | 'put' | 'patch';

export type RequestPath = string | RegExp;

export interface BaseRestRequestConfig<Method extends RestMethod> {
  path: RequestPath;
  method: Method;
  routes: RestRouteConfig<Method>[];
  interceptors?: import('./interceptors').Interceptors;
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
export interface GraphQLRouteConfig {
  entities?: {
    [Key in GraphQLOperationsEntities[GraphQLOperationType]]?: GraphQLEntitiesValues[Key];
  };
  data: any;
  interceptors?: Pick<import('./interceptors').Interceptors, 'response'>;
}

export interface GraphQLQuery {
  operationType: GraphQLOperationType;
  operationName: GraphQLOperationName;
}

export interface GraphQLRequestConfig extends GraphQLQuery {
  routes: GraphQLRouteConfig[];
  interceptors?: import('./interceptors').Interceptors;
}
