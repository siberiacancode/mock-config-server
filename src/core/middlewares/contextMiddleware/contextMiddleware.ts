import type { Express } from 'express';

import { getGraphQLInput, parseQuery } from '@/utils/helpers';
import type { GraphQLEntity, GraphQLOperationName, GraphQLOperationType } from '@/utils/types';

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

export const contextMiddleware = (server: Express) => {
  let requestId = 0;

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
    return next();
  });
};
