import { Request } from 'express';

import { getGraphQLInput } from '../getGraphQLInput/getGraphQLInput';
import { parseQuery } from '../parseQuery/parseQuery';

export const parseGraphQLRequest = (request: Request): ReturnType<typeof parseQuery> | null => {
  const graphQLInput = getGraphQLInput(request);
  if (!graphQLInput.query) return null;

  const query = parseQuery(graphQLInput.query);
  if (!query || query.operationType === 'subscription') return null;

  return { operationType: query.operationType, operationName: query.operationName };
};
