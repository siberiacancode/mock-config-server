import type { Request } from 'express';

import { getGraphQLInput } from './getGraphQLInput';

describe('getGraphQLInput', () => {
  test('Should get right graphQL input from GET request', () => {
    const mockRequest = {
      method: 'GET',
      query: {
        query: `query GetCharacters { characters { name } }`,
        variables: '{"limit": 10}'
      }
    } as unknown as Request;

    const graphQLInput = getGraphQLInput(mockRequest);

    expect(graphQLInput).toStrictEqual({
      query: 'query GetCharacters { characters { name } }',
      variables: { limit: 10 }
    });
  });

  test('Should get right graphQL input from GET request with empty variables', () => {
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

  test('Should get right graphQL input from POST request', () => {
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

  test('Should get right graphQL input from POST with empty variables', () => {
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

  test('Should get error if request is not GET or POST', () => {
    const deleteMockRequest = {
      method: 'DELETE',
      query: {
        query: `query GetCharacters { characters { name } }`
      }
    } as unknown as Request;

    expect(() => getGraphQLInput(deleteMockRequest)).toThrow(
      'Not allowed request method for graphql request'
    );

    const putMockRequest = {
      method: 'PUT',
      body: {
        query: `query GetCharacters { characters { name } }`
      }
    } as unknown as Request;

    expect(() => getGraphQLInput(putMockRequest)).toThrow(
      'Not allowed request method for graphql request'
    );
  });
});
