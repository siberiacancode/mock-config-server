import type { Request } from 'express';

import { getGraphQLInput } from './getGraphQLInput';

describe('getGraphQLInput', () => {
  test('Should get correct graphQL input from GET request (with object variables)', () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: 'query GetCharacters { characters { name } }',
        variables: { limit: 10 }
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get correct graphQL input from GET request (with string variables)', () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: 'query GetCharacters { characters { name } }',
        variables: '{ "limit": 10 }'
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get correct graphQL input from GET request with empty variables', () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: 'query GetCharacters { characters { name } }'
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: undefined
    });
  });

  test('Should get correct graphQL input from GET request with empty query and variables', () => {
    const mockRequest = {
      method: 'GET',
      query: {}
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: undefined,
      variables: undefined
    });
  });

  test('Should get correct graphQL input from POST request', () => {
    const mockRequest = {
      method: 'POST',
      body: {
        query: 'query GetCharacters { characters { name } }',
        variables: { limit: 10 }
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get correct graphQL input from POST with empty variables', () => {
    const mockRequest = {
      method: 'POST',
      body: {
        query: 'query GetCharacters { characters { name } }'
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: undefined
    });
  });

  test('Should get correct graphQL input from POST with empty query and variables', () => {
    const mockRequest = {
      method: 'POST',
      body: {}
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: undefined,
      variables: undefined
    });
  });

  test('Should throw error if request method is not GET or POST', () => {
    const invalidMockRequests = [
      {
        method: 'PUT',
        body: {
          query: 'query GetCharacters { characters { name } }'
        }
      },
      {
        method: 'DELETE',
        query: {
          query: 'query GetCharacters { characters { name } }'
        }
      }
    ] as unknown as Request[];

    invalidMockRequests.forEach((invalidMockRequest) => {
      expect(getGraphQLInput(invalidMockRequest)).toStrictEqual({
        query: undefined,
        variables: undefined
      });
    });
  });
});
