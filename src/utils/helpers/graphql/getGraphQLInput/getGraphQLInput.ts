import type { Request } from 'express';

import type { PlainObject } from '@/utils/types';

interface GetGraphQLInputResult {
  query: string | undefined;
  variables: PlainObject | undefined;
}

export const getGraphQLInput = (request: Request): GetGraphQLInputResult => {
  if (request.method === 'GET') {
    const { query, variables } = request.query;

    // ✅ important:
    // if 'variables' was sent as encoded uri component then it already decoded into object and we do not need to use JSON.parse
    return {
      query: query?.toString(),
      variables: typeof variables === 'string' ? JSON.parse(variables) : variables
    };
  }

  if (request.method === 'POST') {
    const { query, variables } = request.body;
    return { query, variables };
  }

  throw new Error(`Not allowed request method ${request.method} for graphql request`);
};
