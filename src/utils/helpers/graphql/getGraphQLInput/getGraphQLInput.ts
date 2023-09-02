import type { Request } from 'express';

import type { PlainObject } from '@/utils/types';

interface GetGraphQLInputResult {
  query: string | undefined;
  variables: PlainObject | undefined;
}

export const getGraphQLInput = (request: Request): GetGraphQLInputResult => {
  if (request.method === 'GET') {
    const { query, variables } = request.query;

    return {
      query: query?.toString(),
      variables: variables && JSON.parse(variables as string)
    };
  }

  if (request.method === 'POST') {
    const { query, variables } = request.body;
    return { query, variables };
  }

  throw new Error(`Not allowed request method ${request.method} for graphql request`);
};
