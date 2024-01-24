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

type GraphQLSettings = {
  readonly polling: boolean;
};

export type GraphQLRouteConfig<Settings extends GraphQLSettings = GraphQLSettings> = (
  | {
      settings: Settings & { polling: true };
      queue: Array<{
        time?: number;
        data:
          | ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>)
          | Data;
      }>;
    }
  | {
      settings?: Settings & { polling: false };
      data:
        | ((request: Request, entities: GraphQLEntitiesByEntityName) => Data | Promise<Data>)
        | Data;
    }
) & { entities?: GraphQLEntitiesByEntityName; interceptors?: Pick<Interceptors, 'response'> };

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
