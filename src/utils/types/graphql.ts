import type { Request } from 'express';

import type { Interceptors } from './interceptors';
import type { Data, PlainObject, VariablesValue } from './values';

export type GraphQLVariables = Record<string, any>;
export interface GraphQLInput {
  query?: string;
  variables: GraphQLVariables;
}

export type GraphQLEntities = 'headers' | 'cookies' | 'query' | 'variables';

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
