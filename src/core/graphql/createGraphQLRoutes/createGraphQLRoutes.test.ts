import express from 'express';
import request from 'supertest';

import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig } from '@/utils/types';

import { createGraphQLRoutes } from './createGraphQLRoutes';

describe('createGraphQLRoutes', () => {
  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'graphql' | 'interceptors' | 'baseUrl'>
  ) => {
    const server = express();
    const routerBase = express.Router();
    const routerWithRoutes = createGraphQLRoutes(
      routerBase,
      mockServerConfig.graphql?.configs ?? [],
      mockServerConfig.interceptors
    );

    const graphqlBaseUrl = urlJoin(
      mockServerConfig.baseUrl ?? '/',
      mockServerConfig.graphql?.baseUrl ?? '/'
    );

    server.use(express.json());
    server.use(graphqlBaseUrl, routerWithRoutes);
    return server;
  };

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
                  headers: { key1: 'value1', key2: 'value2' },
                  query: { key1: 'value1' }
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
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(postResponse.statusCode).toBe(200);
    expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const getResponse = await request(server)
      .get('/')
      .set({ key1: 'value1', key2: 'value2' })
      .query({
        query: 'query GetUsers { users { name } }',
        key1: 'value1',
        key2: 'value2'
      });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
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
                entities: {
                  headers: { key1: 'value1', key2: 'value2' },
                  query: { key1: 'value1' }
                },
                data: { name: 'John', surname: 'Doe' }
              }
            ]
          }
        ]
      }
    });

    const postResponse = await request(server).post('/').send({ query: 'invalid query' });

    expect(postResponse.statusCode).toBe(400);
    expect(postResponse.body).toBe('Query is invalid, you must use a valid GraphQL query');

    const getResponse = await request(server).get('/').query({
      query: 'invalid query'
    });

    expect(postResponse.statusCode).toBe(400);
    expect(getResponse.body).toBe('Query is invalid, you must use a valid GraphQL query');
  });

  test('Should match config by entities "includes" behavior with operationName regexp', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: /^Get(.+?)sers$/g,
            operationType: 'query',
            routes: [
              {
                entities: {
                  headers: { key1: 'value1', key2: 'value2' },
                  query: { key1: 'value1' }
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
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(postResponse.statusCode).toBe(200);
    expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const getResponse = await request(server)
      .get('/')
      .set({ key1: 'value1', key2: 'value2' })
      .query({
        query: 'query GetUsers { users { name } }',
        key1: 'value1',
        key2: 'value2'
      });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should give priority to more specific route config', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                entities: {
                  headers: { key1: 'value1', key2: 'value2' },
                  query: { key1: 'value1' }
                },
                data: { name: 'John', surname: 'Doe' }
              },
              {
                entities: {
                  headers: { key1: 'value1', key2: 'value2' },
                  query: { key1: 'value1', key2: 'value2' }
                },
                data: { name: 'John', surname: 'Smith' }
              }
            ]
          }
        ]
      }
    });

    const postResponse = await request(server)
      .post('/')
      .send({ query: 'query GetUsers { users { name } }' })
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(postResponse.statusCode).toBe(200);
    expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Smith' });

    const getResponse = await request(server)
      .get('/')
      .set({ key1: 'value1', key2: 'value2' })
      .query({
        query: 'query GetUsers { users { name } }',
        key1: 'value1',
        key2: 'value2'
      });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Smith' });
  });

  test('Should return 404 and description text for no matched request configs', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                entities: {
                  headers: { key1: 'value1' }
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

    const getResponse = await request(server).get('/').set({ key2: 'value2' }).query({
      query: 'query GetUsers { users { name } }'
    });

    expect(getResponse.statusCode).toBe(404);
  });

  test('Should compare non plain object variables by full equal behavior', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                entities: {
                  variables: [
                    {
                      key1: 'value1',
                      key2: { nestedKey1: 'nestedValue1' }
                    }
                  ]
                },
                data: { name: 'John', surname: 'Doe' }
              }
            ]
          }
        ]
      }
    });

    const successPostResponse = await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'query GetUsers { users { name } }',
        variables: [{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]
      });

    expect(successPostResponse.statusCode).toBe(200);
    expect(successPostResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const successGetResponse = await request(server)
      .get('/')
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables: '[{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1" } }]'
      });

    expect(successGetResponse.statusCode).toBe(200);
    expect(successGetResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const failedPostResponse = await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'query GetUsers { users { name } }',
        variables: [
          { key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }
        ]
      });

    expect(failedPostResponse.statusCode).toBe(404);

    const failedGetResponse = await request(server)
      .get('/')
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables:
          '[{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1", "nestedKey2": "nestedValue2" } }]'
      });

    expect(failedGetResponse.statusCode).toBe(404);
  });

  test('Should compare plain object variables by "includes" behavior', async () => {
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
                    key2: { nestedKey1: 'nestedValue1' }
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
      .set('Content-Type', 'application/json')
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
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables:
          '{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1", "nestedKey2": "nestedValue2" } }'
      });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should call request interceptors in order: request -> server', async () => {
    const requestInterceptor = jest.fn();
    const serverInterceptor = jest.fn();
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
                    key2: 'value2'
                  }
                },
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
                entities: {
                  variables: {
                    key1: 'value1',
                    key2: 'value2'
                  }
                },
                data: { name: 'John', surname: 'Smith' }
              }
            ]
          }
        ]
      },
      interceptors: { request: serverInterceptor }
    });

    await request(server).get('/').set('Content-Type', 'application/json').query({
      query: 'query GetUsers { users { name } }',
      variables: '{ "key1": "value1", "key2": "value2" }'
    });
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );

    await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'mutation CreateUser($name: String!) { createUser(name: $name) { name } }',
        variables: { key1: 'value1', key2: 'value2' }
      });
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);
  });

  test('Should call response interceptors in order: route -> request -> server', async () => {
    const routeInterceptor = jest.fn();
    const requestInterceptor = jest.fn();
    const serverInterceptor = jest.fn();
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
                    key2: 'value2'
                  }
                },
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
                entities: {
                  variables: {
                    key1: 'value1',
                    key2: 'value2'
                  }
                },
                data: { name: 'John', surname: 'Smith' }
              }
            ]
          }
        ]
      },
      interceptors: { response: serverInterceptor }
    });

    await request(server).get('/').set('Content-Type', 'application/json').query({
      query: 'query GetUsers { users { name } }',
      variables: '{ "key1": "value1", "key2": "value2" }'
    });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);
    expect(routeInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      requestInterceptor.mock.invocationCallOrder[0]
    );
    expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );

    await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'mutation CreateUser($name: String!) { createUser(name: $name) { name } }',
        variables: { key1: 'value1', key2: 'value2' }
      });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);

    await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'query GetSettings { settings { notifications } }',
        variables: { key1: 'value1', key2: 'value2' }
      });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);
  });
});
