import type { Request } from 'express';

import type { GraphQLInput } from '@/utils/types';

export const getGraphQLInput = (request: Request): GraphQLInput => {
  if (request.method === 'GET') {
    const { query, variables } = request.query;

    return {
      query: query?.toString(),
      variables: JSON.parse((variables as string) ?? '{}')
    };
  }

  if (request.method === 'POST') {
    const { query, variables } = request.body;

    return {
      query,
      variables: variables ?? {}
    };
  }

  throw new Error('Not allowed request method for graphql request');
};
