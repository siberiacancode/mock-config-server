import type { Interceptors } from './interceptors';

export type GraphQLVariables = Record<string, any>;
export interface GraphQLInput {
  query?: string;
  variables: GraphQLVariables;
}

export type VariablesValue = any;
export type PlainObject = Record<string, string | number>;

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
