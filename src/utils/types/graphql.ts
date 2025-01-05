import type { Request } from 'express';

import type { MappedEntity, PlainEntity } from './entities';
import type { Interceptors } from './interceptors';
import type { Data } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';

export type GraphQLEntity<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables' ? PlainEntity : MappedEntity;

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;

export type GraphQLEntitiesByEntityName = {
  [EntityName in GraphQLEntityName]?: GraphQLEntity<EntityName>;
};

interface GraphQLSettings {
  readonly polling?: boolean;
  readonly status?: number;
  readonly delay?: number;
}

export type GraphqlDataResponse =
  | ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>)
  | Data;

export type GraphQLRouteConfig = (
  | {
      settings: GraphQLSettings & { polling: true };
      queue: Array<{
        time?: number;
        data: GraphqlDataResponse;
      }>;
    }
  | {
      settings?: GraphQLSettings & { polling?: false };
      data: GraphqlDataResponse;
    }
) & { entities?: GraphQLEntitiesByEntityName; interceptors?: Interceptors<'graphql'> };

interface BaseGraphQLRequestConfig {
  operationType: GraphQLOperationType;
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors<'graphql'>;
}

export interface OperationNameGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  operationName: GraphQLOperationName;
}

interface QueryGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  query: string;
}

export type GraphQLRequestConfig = OperationNameGraphQLRequestConfig | QueryGraphQLRequestConfig;
