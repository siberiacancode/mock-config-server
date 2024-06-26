import type { Request } from 'express';

import type { MappedEntity, PlainEntity } from './entities';
import type { Interceptors } from './interceptors';
import type { Data } from './values';

export type GraphQLEntityName = 'headers' | 'cookies' | 'query' | 'variables';

export type GraphQLEntity<EntityName extends GraphQLEntityName = GraphQLEntityName> =
  EntityName extends 'variables' ? PlainEntity : MappedEntity;

export type GraphQLOperationType = 'query' | 'mutation';
export type GraphQLOperationName = string | RegExp;
export type GraphQLEntityNamesByOperationType = {
  [operationType in GraphQLOperationType]: GraphQLEntityName;
};
export type GraphQLEntitiesByEntityName = {
  [EntityName in GraphQLEntityName]?: GraphQLEntity<EntityName>;
};

interface GraphQLSettings {
  readonly polling?: boolean;
  readonly status?: number;
  readonly delay?: number;
}

export type GraphQLRouteConfig = (
  | {
      settings: GraphQLSettings & { polling: true };
      queue: Array<{
        time?: number;
        data:
          | ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>)
          | Data;
      }>;
    }
  | {
      settings?: GraphQLSettings & { polling?: false };
      data:
        | ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>)
        | Data;
    }
) & { entities?: GraphQLEntitiesByEntityName; interceptors?: Interceptors };

interface BaseGraphQLRequestConfig {
  operationType: GraphQLOperationType;
  routes: GraphQLRouteConfig[];
  interceptors?: Interceptors;
}

export interface OperationNameGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  operationName: GraphQLOperationName;
}

interface QueryGraphQLRequestConfig extends BaseGraphQLRequestConfig {
  query: string;
}

export type GraphQLRequestConfig = OperationNameGraphQLRequestConfig | QueryGraphQLRequestConfig;
