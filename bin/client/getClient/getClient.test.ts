import { MockServerConfig } from '../../../src';

import { getClient } from './getClient';

jest.mock('../../../mock-server.config', () => {
  const posts = [
    { title: 'First post title', body: 'First post body' },
    { title: 'Second post title', body: 'Second post body' }
  ] as const;

  const mockConfig = {
    rest: {
      baseUrl: '/rest',
      configs: [
        {
          path: '/posts',
          method: 'get',
          routes: [{ data: posts }]
        },
        {
          path: '/posts/:postId',
          method: 'get',
          routes: posts.map((post, index) => ({
            data: post,
            entities: { params: { postId: `${index + 1}` } }
          }))
        },
        {
          path: '/posts',
          method: 'post',
          routes: [
            {
              data: 'post created',
              entities: { body: { title: 'title', body: 'body' } }
            }
          ]
        },
        {
          path: '/posts/:postId',
          method: 'put',
          routes: [
            {
              data: 'post changed',
              entities: { params: { postId: '1' }, body: { title: 'new title', body: 'new body' } }
            }
          ]
        },
        {
          path: '/posts/:postId',
          method: 'delete',
          routes: [
            {
              data: 'post deleted',
              entities: { params: { postId: '1' } }
            }
          ]
        }
      ]
    },

    graphql: {
      baseUrl: '/graphql',
      configs: [
        {
          operationName: 'GetCharacters',
          operationType: 'query',
          routes: [{ data: {} }]
        },
        {
          operationName: 'CreateCharacter',
          operationType: 'mutation',
          routes: [
            {
              entities: { variables: { 'user.name': 'testName' } },
              data: { result: 'Character created' }
            }
          ]
        }
      ]
    }
  } satisfies MockServerConfig;

  return {
    config: mockConfig
  };
});

describe('getClient', () => {
  describe('REST', () => {
    test('Should correctly return data if correct params provided', () => {
      // @ts-ignore because typescript will look at real mock-server.config.ts that does not have this request
      const result = getClient().rest('get', '/posts/:postId', { params: { postId: '1' } });

      expect(result).toEqual({ title: 'First post title', body: 'First post body' });
    });

    test('Should throw error if invalid method provided', () => {
      // @ts-ignore because method parameter is type safe
      expect(() => getClient().rest('ge', '/posts/:postId', { params: { postId: '1' } })).toThrow(
        Error(
          'Wrong method or path.\n' +
            'Received request: GE /posts/:postId\n' +
            'Possible requests:\n' +
            ' - GET /posts,\n' +
            ' - GET /posts/:postId,\n' +
            ' - POST /posts,\n' +
            ' - PUT /posts/:postId,\n' +
            ' - DELETE /posts/:postId'
        )
      );
    });

    test('Should throw error if invalid request provided', () => {
      // @ts-ignore because path parameter is type safe
      expect(() => getClient().rest('get', '/postss/:postId', { params: { postId: '1' } })).toThrow(
        Error(
          'Wrong method or path.\n' +
            'Received request: GET /postss/:postId\n' +
            'Possible requests:\n' +
            ' - GET /posts,\n' +
            ' - GET /posts/:postId,\n' +
            ' - POST /posts,\n' +
            ' - PUT /posts/:postId,\n' +
            ' - DELETE /posts/:postId'
        )
      );
    });

    test('Should throw error if invalid params provided', () => {
      // @ts-ignore because typescript will look at real mock-server.config.ts that does not have this request
      expect(() => getClient().rest('get', '/posts/:postId', { params: { postId: '-1' } })).toThrow(
        Error(
          'Wrong params.\n' +
            'Received params: {"params":{"postId":"-1"}}\n' +
            'Possible params for this request:\n' +
            '{"params":{"postId":"1"}},\n' +
            '{"params":{"postId":"2"}}'
        )
      );
    });
  });

  describe('GraphQL', () => {
    test('Should correctly return data if correct params provided', () => {
      // @ts-ignore because typescript will look at real mock-server.config.ts that does not have this request
      const result = getClient().graphql('mutation', 'CreateCharacter', {
        variables: { 'user.name': 'testName' }
      });

      expect(result).toEqual({ result: 'Character created' });
    });

    test('Should throw error if invalid operationType provided', () => {
      expect(() =>
        // @ts-ignore because operationType parameter is type safe
        getClient().graphql('mutationn', 'CreateCharacter', {
          variables: { 'user.name': 'testName' }
        })
      ).toThrow(
        Error(
          'Wrong operationType or operationName.\n' +
            'Received request: mutationn CreateCharacter\n' +
            'Possible requests:\n' +
            ' - query GetCharacters,\n' +
            ' - mutation CreateCharacter'
        )
      );
    });

    test('Should throw error if invalid operationName provided', () => {
      expect(() =>
        // @ts-ignore because operationName parameter is type safe
        getClient().graphql('mutation', 'CreateCharacterr', {
          variables: { 'user.name': 'testName' }
        })
      ).toThrow(
        Error(
          'Wrong operationType or operationName.\n' +
            'Received request: mutation CreateCharacterr\n' +
            'Possible requests:\n' +
            ' - query GetCharacters,\n' +
            ' - mutation CreateCharacter'
        )
      );
    });

    test('Should throw error if invalid params provided', () => {
      expect(() =>
        // @ts-ignore because typescript will look at real mock-server.config.ts that does not have this request
        getClient().graphql('mutation', 'CreateCharacter', {
          variables: { 'user.name': 'wrongTestName' }
        })
      ).toThrow(
        Error(
          'Wrong params.\n' +
            'Received params: {"variables":{"user.name":"wrongTestName"}}\n' +
            'Possible params for this request:\n' +
            '{"variables":{"user.name":"testName"}}'
        )
      );
    });
  });
});
