import express from 'express';
import request from 'supertest';

import { urlJoin } from '@/utils/helpers';
import type { GraphqlConfig, GraphQLOperationType, MockServerConfig } from '@/utils/types';

import { createGraphQLRoutes } from './createGraphQLRoutes';

const createServer = (
  mockServerConfig: Pick<MockServerConfig, 'interceptors' | 'baseUrl'> & {
    graphql: GraphqlConfig;
  }
) => {
  const { baseUrl, graphql, interceptors } = mockServerConfig;
  const server = express();
  const routerBase = express.Router();
  const routerWithRoutes = createGraphQLRoutes({
    router: routerBase,
    graphqlConfig: graphql,
    serverResponseInterceptor: interceptors?.response
  });

  const graphqlBaseUrl = urlJoin(baseUrl ?? '/', graphql?.baseUrl ?? '/');

  server.use(express.json());
  server.use(graphqlBaseUrl, routerWithRoutes);
  return server;
};

describe('createRestRoutes', () => {
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
                  headers: {
                    key1: 'value1',
                    key2: 'value2'
                  },
                  query: {
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

    const postResponse = await request(server).post('/').send({ query: 'invalid query' });

    expect(postResponse.statusCode).toBe(400);
    expect(postResponse.body).toStrictEqual({
      message: 'Query is invalid, you must use a valid GraphQL query'
    });

    const getResponse = await request(server).get('/').query({
      query: 'invalid query'
    });

    expect(postResponse.statusCode).toBe(400);
    expect(getResponse.body).toStrictEqual({
      message: 'Query is invalid, you must use a valid GraphQL query'
    });
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

    const getResponse = await request(server).get('/').set({ key2: 'value2' }).query({
      query: 'query GetUsers { users { name } }'
    });

    expect(getResponse.statusCode).toBe(404);
  });

  test('Should have response Cache-Control header value equals to no-cache', async () => {
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
    expect(postResponse.headers['cache-control']).toBe('no-cache');

    const getResponse = await request(server)
      .get('/')
      .query({ query: 'query GetUsers { users { name } }' });
    expect(getResponse.headers['cache-control']).toBe('no-cache');
  });

  const operationTypesWithoutCacheControlHeader: Exclude<GraphQLOperationType, 'query'>[] = [
    'mutation'
  ];
  operationTypesWithoutCacheControlHeader.forEach((operationTypeWithoutCacheControlHeader) => {
    test(`Should do not have Cache-Control header if operation type is ${operationTypeWithoutCacheControlHeader}`, async () => {
      const server = createServer({
        graphql: {
          configs: [
            {
              operationName: 'GetUsers',
              operationType: operationTypeWithoutCacheControlHeader,
              routes: [{ data: { name: 'John', surname: 'Doe' } }]
            }
          ]
        }
      });

      const postResponse = await request(server)
        .post('/')
        .send({ query: 'query GetUsers { users { name } }' });
      expect(postResponse.headers['cache-control']).toBe(undefined);

      const getResponse = await request(server)
        .get('/')
        .query({ query: 'query GetUsers { users { name } }' });
      expect(getResponse.headers['cache-control']).toBe(undefined);
    });
  });
});

describe('createRestRoutes: content', () => {
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
                  query: {
                    key1: 'value1'
                  }
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
      key1: 'value1'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      url: `/?query=${encodeURIComponent('query GetUsers { users { name } }')}&key1=value1`,
      query: {
        key1: 'value1'
      }
    });
  });

  test('Should correctly use data function with polling setting', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                settings: { polling: true },
                entities: {
                  query: {
                    key1: 'value1'
                  }
                },
                queue: [
                  {
                    data: ({ url }, { query }) => ({
                      url,
                      query
                    })
                  }
                ]
              }
            ]
          }
        ]
      }
    });

    const response = await request(server).get('/').query({
      query: 'query GetUsers { users { name } }',
      key1: 'value1'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      url: `/?query=${encodeURIComponent('query GetUsers { users { name } }')}&key1=value1`,
      query: {
        key1: 'value1'
      }
    });
  });

  test('Should return same polling data with time param', async () => {
    jest.useFakeTimers();
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                settings: { polling: true },
                queue: [
                  { time: 2000, data: { name: 'John', surname: 'Doe' } },
                  { data: { name: 'John', surname: 'Smith' } }
                ]
              }
            ]
          }
        ]
      }
    });

    const query = {
      query: 'query GetUsers { users { name } }',
      key1: 'value1'
    };

    const firstResponse = await request(server).get('/').query(query);
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    jest.advanceTimersByTime(1000);

    const secondResponse = await request(server).get('/').query(query);
    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    jest.advanceTimersByTime(1000);

    const thirdResponse = await request(server).get('/').query(query);
    expect(thirdResponse.statusCode).toBe(200);
    expect(thirdResponse.body).toEqual({ name: 'John', surname: 'Smith' });

    jest.useRealTimers();
  });

  test('Should correct handle empty queue', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                settings: { polling: true },
                queue: []
              }
            ]
          }
        ]
      }
    });

    const query = {
      query: 'query GetUsers { users { name } }'
    };

    const response = await request(server).get('/').query(query);
    expect(response.statusCode).toBe(404);
  });
});

describe('createRestRoutes: settings', () => {
  test('Should correctly process the request with polling', async () => {
    const server = createServer({
      graphql: {
        configs: [
          {
            operationName: 'GetUsers',
            operationType: 'query',
            routes: [
              {
                settings: { polling: true },
                queue: [
                  { data: { name: 'John', surname: 'Doe' } },
                  { data: { name: 'John', surname: 'Smith' } }
                ]
              }
            ]
          }
        ]
      }
    });

    const query = {
      query: 'query GetUsers { users { name } }'
    };

    const firstResponse = await request(server).get('/').query(query);
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    const secondResponse = await request(server).get('/').query(query);
    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual({ name: 'John', surname: 'Smith' });

    const thirdResponse = await request(server).get('/').query(query);
    expect(thirdResponse.statusCode).toBe(200);
    expect(thirdResponse.body).toEqual({ name: 'John', surname: 'Doe' });
  });
});

describe('createRestRoutes: entities', () => {
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
                  headers: {
                    key1: 'value1',
                    key2: 'value2'
                  },
                  query: {
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
                  headers: {
                    key1: 'value1',
                    key2: 'value2'
                  },
                  query: {
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
                  headers: {
                    key1: 'value1',
                    key2: 'value2'
                  },
                  query: {
                    key1: 'value1'
                  }
                },
                data: { name: 'John', surname: 'Doe' }
              },
              {
                entities: {
                  headers: {
                    key1: 'value1',
                    key2: 'value2'
                  },
                  query: {
                    key1: 'value1',
                    key2: 'value2'
                  }
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

  test('Should strictly compare plain array body if top level descriptor used', async () => {
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
                    value: [
                      {
                        key1: 'value1',
                        key2: { nestedKey1: 'nestedValue1' }
                      }
                    ]
                  }
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
        variables: {
          key1: 'value1',
          key2: { nestedKey1: 'nestedValue1' }
        }
      });

    expect(successPostResponse.statusCode).toBe(200);
    expect(successPostResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const failedPostResponse = await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'query GetUsers { users { name } }',
        variables: {
          key1: 'value1',
          key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' }
        }
      });

    expect(failedPostResponse.statusCode).toBe(404);

    const successGetResponse = await request(server)
      .get('/')
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables: '{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1" } }'
      });

    expect(successGetResponse.statusCode).toBe(200);
    expect(successGetResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const failedGetResponse = await request(server)
      .get('/')
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables:
          '{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1", "nestedKey2": "nestedValue2" } }'
      });

    expect(failedGetResponse.statusCode).toBe(404);
  });

  test('Should strictly compare plain object variables if top level descriptor used', async () => {
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
                    value: {
                      key1: 'value1',
                      key2: { nestedKey1: 'nestedValue1' }
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
      .set('Content-Type', 'application/json')
      .send({
        query: 'query GetUsers { users { name } }',
        variables: {
          key1: 'value1',
          key2: { nestedKey1: 'nestedValue1' }
        }
      });

    expect(postResponse.statusCode).toBe(200);
    expect(postResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const getResponse = await request(server)
      .get('/')
      .set('Content-Type', 'application/json')
      .query({
        query: 'query GetUsers { users { name } }',
        variables: '{ "key1": "value1", "key2": { "nestedKey1": "nestedValue1" } }'
      });

    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

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

describe('createRestRoutes: interceptors', () => {
  test('Should call request interceptor', async () => {
    const requestInterceptor = jest.fn();
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
      }
    });

    await request(server).get('/').set('Content-Type', 'application/json').query({
      query: 'query GetUsers { users { name } }',
      variables: '{ "key1": "value1", "key2": "value2" }'
    });
    expect(requestInterceptor.mock.calls.length).toBe(1);

    await request(server)
      .post('/')
      .set('Content-Type', 'application/json')
      .send({
        query: 'mutation CreateUser($name: String!) { createUser(name: $name) { name } }',
        variables: { key1: 'value1', key2: 'value2' }
      });
    expect(requestInterceptor.mock.calls.length).toBe(1);
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
