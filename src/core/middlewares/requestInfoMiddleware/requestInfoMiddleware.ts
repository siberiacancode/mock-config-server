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
        operationName: GraphQLOperationName;
        variables?: GraphQLEntity<'variables'>;
      } | null;
      context: any;
    }
  }
}

export const requestInfoMiddleware = (server: Express) => {
  let requestId = 0;

  server.use((request, _response, next) => {
    requestId += 1;
    request.id = requestId;

    request.timestamp = Date.now();

    const graphQLInput = getGraphQLInput(request);
    const graphQLQuery = parseQuery(graphQLInput.query ?? '');
    const isValidGraphQLRequest =
      graphQLInput &&
      graphQLInput.query &&
      graphQLQuery?.operationType &&
      graphQLQuery.operationName;
    request.graphQL = isValidGraphQLRequest
      ? {
          operationType: graphQLQuery.operationType as GraphQLOperationType,
          operationName: graphQLQuery.operationName as GraphQLOperationName,
          variables: graphQLInput.variables
        }
      : null;

    return next();
  });
};
