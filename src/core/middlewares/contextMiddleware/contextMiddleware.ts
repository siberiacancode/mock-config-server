import type { Express } from 'express';

import { createOrm, createStorage } from '@/core/database';
import { getGraphQLInput, parseQuery } from '@/utils/helpers';
import type {
  GraphQLEntity,
  GraphQLOperationName,
  GraphQLOperationType,
  MockServerConfig
} from '@/utils/types';

declare global {
  namespace Express {
    export interface Request {
      id: number;
      timestamp: number;
      graphQL: {
        operationType: GraphQLOperationType;
        operationName?: GraphQLOperationName;
        query: string;
        variables?: GraphQLEntity<'variables'>;
      } | null;
    }
  }
}

export const contextMiddleware = (
  server: Express,
  { database }: Pick<MockServerConfig, 'database'>
) => {
  let requestId = 0;
  const context: Express['request']['context'] = { orm: {} };

  if (database) {
    const storage = createStorage(database.data);
    const orm = createOrm(storage);
    context.orm = orm;
  }

  server.use((request, _response, next) => {
    requestId += 1;
    request.id = requestId;

    request.timestamp = Date.now();

    const graphQLInput = getGraphQLInput(request);
    const graphQLQuery = parseQuery(graphQLInput.query ?? '');

    if (graphQLInput.query && graphQLQuery) {
      request.graphQL = {
        operationType: graphQLQuery.operationType as GraphQLOperationType,
        operationName: graphQLQuery.operationName,
        query: graphQLInput.query,
        variables: graphQLInput.variables
      };
      return next();
    }

    request.graphQL = null;
    request.context = context;
    return next();
  });
};
