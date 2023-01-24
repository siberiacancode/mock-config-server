import type { Request } from 'express';

import { getGraphQLInput } from './getGraphQLInput';

describe('getGraphQLInput', () => {
  test('Should get right graphQL input from get request', async () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: `query GetCharacters { characters { name } }`,
        variables: '{"limit": 10}'
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest as unknown as Request);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get right graphQL input from get request with empty variables', async () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: `query GetCharacters { characters { name } }`
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: {}
    });
  });

  test('Should get right graphQL input from post request', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        query: `query GetCharacters { characters { name } }`,
        variables: { limit: 10 }
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get right graphQL input from post with empty variables', async () => {
    const mockRequest = {
      method: 'POST',
      body: {
        query: `query GetCharacters { characters { name } }`
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: {}
    });
  });
});
