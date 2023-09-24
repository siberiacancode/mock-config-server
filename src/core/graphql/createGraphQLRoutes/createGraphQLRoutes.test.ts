import express from 'express';
import request from 'supertest';

import { cookieParseMiddleware } from '@/core/middlewares';
import { urlJoin } from '@/utils/helpers';
import type { GraphqlConfig, MockServerConfig } from '@/utils/types';

import { createGraphQLRoutes } from './createGraphQLRoutes';

describe('createGraphQLRoutes', () => {
  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'interceptors' | 'baseUrl'> & {
      graphql: GraphqlConfig;
    }
  ) => {
    const server = express();
    cookieParseMiddleware(server);

    const routerBase = express.Router();
    const routerWithRoutes = createGraphQLRoutes(
      routerBase,
      mockServerConfig.graphql,
      mockServerConfig.interceptors?.response
    );

    const graphqlBaseUrl = urlJoin(
      mockServerConfig.baseUrl ?? '/',
      mockServerConfig.graphql?.baseUrl ?? '/'
    );

    server.use(express.json());
    server.use(graphqlBaseUrl, routerWithRoutes);
    return server;
  };

  describe('createGraphQLRoutes: graphql query validation', () => {
    test('Should return 400 and description text for missing query', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server).post('/');
      expect(postResponse.statusCode).toBe(400);
      expect(postResponse.body).toStrictEqual({
        message: 'Query is missing, you must pass a valid GraphQL query'
      });

      const getResponse = await request(server).get('/');
      expect(getResponse.statusCode).toBe(400);
      expect(getResponse.body).toStrictEqual({
        message: 'Query is missing, you must pass a valid GraphQL query'
      });
    });

    test('Should return 400 and description text for invalid query', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server).post('/').send({ query: 'invalid query' });
      expect(postResponse.statusCode).toBe(400);
      expect(postResponse.body).toStrictEqual({
        message: 'Query is invalid, you must use a valid GraphQL query'
      });

      const getResponse = await request(server).get('/').query({ query: 'invalid query' });
      expect(getResponse.statusCode).toBe(400);
      expect(getResponse.body).toStrictEqual({
        message: 'Query is invalid, you must use a valid GraphQL query'
      });
    });
  });

  describe('createGraphQLRoutes: not found config', () => {
    test('Should return 404 for not matched operationType', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'mutation GetUsers { users { name } }' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'mutation GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });

    test('Should return 404 for not matched query', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              query: 'mutation GetUsers { users { name } }',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });

    test('Should return 404 if operationName presented in config but not presented in actual query', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query { users { name } }' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });

    test('Should return 404 if actual query operationName does not match to config RegExp operationName', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: /GetUsers\d+/,
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });

    test('Should return 404 if actual query operationName does not mathc to config string operationName', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetSettings',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });

    test('Should return 404 for no matched by entities request configs', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    headers: {
                      key1: 'value1'
                    }
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' })
        .set({ key2: 'value2' });
      expect(postResponse.statusCode).toBe(404);

      const getResponse = await request(server)
        .get('/')
        .set({ key2: 'value2' })
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(404);
    });
  });

  describe('createGraphQLRoutes: entities "includes" and strictly compare behavior', () => {
    test('Should match config by entities "includes" behavior', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    headers: { key1: 'value1' },
                    cookies: { key1: 'value1' },
                    query: { key1: 'value1' },
                    variables: { key1: 'value1' }
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({
          query: 'query GetUsers { users { name } }',
          variables: { key1: 'value1', key2: 'value2' }
        })
        .set({
          key1: 'value1',
          key2: 'value2',
          Cookie: 'key1=value1; key2=value2'
        })
        .query({
          key1: 'value1',
          key2: 'value2'
        });
      expect(postResponse.statusCode).toBe(200);
      expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const getResponse = await request(server)
        .get('/')
        .set({
          key1: 'value1',
          key2: 'value2',
          Cookie: 'key1=value1; key2=value2'
        })
        .query({
          query: 'query GetUsers { users { name } }',
          variables: { key1: 'value1', key2: 'value2' },
          key1: 'value1',
          key2: 'value2'
        });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
    });

    test('Should strictly compare variables if using top-level descriptor', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    variables: {
                      checkMode: 'equals',
                      value: { key1: 'value1' }
                    }
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const matchedResponse = await request(server)
        .post('/')
        .send({
          query: 'query GetUsers { users { name } }',
          variables: { key1: 'value1' }
        });
      expect(matchedResponse.statusCode).toBe(200);
      expect(matchedResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const mismatchedResponse = await request(server)
        .post('/')
        .send({
          query: 'query GetUsers { users { name } }',
          variables: { key1: 'value1', key2: 'value2' }
        });
      expect(mismatchedResponse.statusCode).toBe(404);
    });
  });

  describe('createGraphQLRoutes: descriptors', () => {
    test('Should correctly resolve flat object variables with descriptors', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    variables: {
                      key1: 'value1',
                      'key2.nestedKey1': {
                        checkMode: 'equals',
                        value: 'nestedValue1'
                      }
                    }
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({
          query: 'query GetUsers { users { name } }',
          variables: {
            key1: 'value1',
            key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' }
          }
        });
      expect(postResponse.statusCode).toBe(200);
      expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const getResponse = await request(server)
        .get('/')
        .query({
          query: 'query GetUsers { users { name } }',
          variables: {
            key1: 'value1',
            key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' }
          }
        });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
    });
  });

  describe('createGraphQLRoutes: interceptors', () => {
    test('Should call request interceptor for specific config', async () => {
      const requestInterceptor = jest.fn();
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ],
              interceptors: { request: requestInterceptor }
            },
            {
              operationName: 'CreateUser',
              operationType: 'mutation',
              routes: [
                {
                  data: { name: 'John', surname: 'Smith' }
                }
              ]
            }
          ]
        }
      });

      await request(server).get('/').query({
        query: 'query GetUsers { users { name } }'
      });
      expect(requestInterceptor.mock.calls.length).toBe(1);

      await request(server)
        .post('/')
        .send({
          query: 'mutation CreateUser($name: String!) { createUser(name: $name) { name } }',
          variables: { name: 'John Doe' }
        });
      expect(requestInterceptor.mock.calls.length).toBe(1);
    });

    test('Should call response interceptors in order: route -> request -> api -> server', async () => {
      const routeInterceptor = jest.fn();
      const requestInterceptor = jest.fn();
      const apiInterceptor = jest.fn();
      const serverInterceptor = jest.fn();
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' },
                  interceptors: { response: routeInterceptor }
                }
              ],
              interceptors: { response: requestInterceptor }
            },
            {
              operationName: 'CreateUser',
              operationType: 'mutation',
              routes: [
                {
                  data: { name: 'John', surname: 'Smith' }
                }
              ]
            }
          ],
          interceptors: { response: apiInterceptor }
        },
        interceptors: { response: serverInterceptor }
      });

      await request(server).get('/').query({
        query: 'query GetUsers { users { name } }'
      });
      expect(routeInterceptor.mock.calls.length).toBe(1);
      expect(requestInterceptor.mock.calls.length).toBe(1);
      expect(apiInterceptor.mock.calls.length).toBe(1);
      expect(serverInterceptor.mock.calls.length).toBe(1);
      expect(routeInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
        requestInterceptor.mock.invocationCallOrder[0]
      );
      expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
        apiInterceptor.mock.invocationCallOrder[0]
      );
      expect(apiInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
        serverInterceptor.mock.invocationCallOrder[0]
      );

      await request(server)
        .post('/')
        .send({
          query: 'mutation CreateUser($name: String!) { createUser(name: $name) { name } }',
          variables: { name: 'John Doe' }
        });
      expect(routeInterceptor.mock.calls.length).toBe(1);
      expect(requestInterceptor.mock.calls.length).toBe(1);
      expect(apiInterceptor.mock.calls.length).toBe(2);
      expect(serverInterceptor.mock.calls.length).toBe(2);

      await request(server).get('/').query({
        query: 'query GetSettings { settings { notifications } }'
      });
      expect(apiInterceptor.mock.calls.length).toBe(2);
      expect(serverInterceptor.mock.calls.length).toBe(2);
    });
  });

  describe('createGraphQLRoutes: data function', () => {
    test('Should correctly use data function', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    query: { key: 'value' }
                  },
                  data: ({ url }, { query }) => ({
                    url,
                    query
                  })
                }
              ]
            }
          ]
        }
      });

      const response = await request(server).get('/').query({
        query: 'query GetUsers { users { name } }',
        key: 'value'
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        url: `/?query=${encodeURIComponent('query GetUsers { users { name } }')}&key=value`,
        query: { key: 'value' }
      });
    });
  });

  describe('createGraphQLRoutes: browsers specific', () => {
    test('Should have response Cache-Control header with max-age=0, must-revalidate value', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [{ data: { name: 'John', surname: 'Doe' } }]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' });
      expect(postResponse.headers['cache-control']).toBe('max-age=0, must-revalidate');

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.headers['cache-control']).toBe('max-age=0, must-revalidate');
    });

    test('Should be case-insensitive for header keys', async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: 'query',
              routes: [
                {
                  entities: {
                    headers: {
                      lowercase: 'lowercase',
                      UPPERCASE: 'UPPERCASE'
                    }
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' })
        .set({ LowerCase: 'lowercase', upperCase: 'UPPERCASE' });
      expect(postResponse.statusCode).toBe(200);
      expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const getResponse = await request(server)
        .get('/')
        .set({ LowerCase: 'lowercase', upperCase: 'UPPERCASE' })
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.statusCode).toBe(200);
      expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
    });
  });
});
