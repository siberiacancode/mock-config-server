import express from 'express';
import request from 'supertest';

import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig, RestConfig } from '@/utils/types';

import { createRestRoutes } from './createRestRoutes';

const createServer = (
  mockServerConfig: Pick<MockServerConfig, 'interceptors' | 'baseUrl'> & {
    rest: RestConfig;
  }
) => {
  const { baseUrl, rest, interceptors } = mockServerConfig;
  const server = express();
  const routerBase = express.Router();
  const routerWithRoutes = createRestRoutes({
    router: routerBase,
    restConfig: rest,
    serverResponseInterceptor: interceptors?.response
  });

  const restBaseUrl = urlJoin(baseUrl ?? '/', rest?.baseUrl ?? '/');

  server.use(express.json());
  server.use(restBaseUrl, routerWithRoutes);
  return server;
};

describe('createRestRoutes', () => {
  test('Should return 404 for no matched request configs', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server).get('/users').set({ key2: 'value2' });

    expect(response.statusCode).toBe(404);
  });

  test('Should have response Cache-Control header equals to max-age=0, must-revalidate', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
            routes: [{ data: { name: 'John', surname: 'Doe' } }]
          }
        ]
      }
    });

    const response = await request(server).get('/users');
    expect(response.headers['cache-control']).toBe('max-age=0, must-revalidate');
  });
});

describe('createRestRoutes: content', () => {
  test('Should correctly use data function', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server).get('/users').query({ key1: 'value1' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      url: '/users?key1=value1',
      query: {
        key1: 'value1'
      }
    });
  });

  test('Should correctly use data function with polling setting', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server).get('/users').query({ key1: 'value1' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      url: '/users?key1=value1',
      query: {
        key1: 'value1'
      }
    });
  });

  test('Should return same polling data with time param', async () => {
    jest.useFakeTimers();
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const query = { key1: 'value1' };

    const firstResponse = await request(server).get('/users').query(query);
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    jest.advanceTimersByTime(1000);

    const secondResponse = await request(server).get('/users').query(query);
    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    jest.advanceTimersByTime(1000);

    const thirdResponse = await request(server).get('/users').query(query);
    expect(thirdResponse.statusCode).toBe(200);
    expect(thirdResponse.body).toEqual({ name: 'John', surname: 'Smith' });

    jest.useRealTimers();
  });
});

describe('createRestRoutes: settings', () => {
  test('Should correctly process the request with polling', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const firstResponse = await request(server).get('/users');
    expect(firstResponse.statusCode).toBe(200);
    expect(firstResponse.body).toEqual({ name: 'John', surname: 'Doe' });

    const secondResponse = await request(server).get('/users');
    expect(secondResponse.statusCode).toBe(200);
    expect(secondResponse.body).toEqual({ name: 'John', surname: 'Smith' });

    const thirdResponse = await request(server).get('/users');
    expect(thirdResponse.statusCode).toBe(200);
    expect(thirdResponse.body).toEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should correct handle empty queue', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server).get('/users');
    expect(response.statusCode).toBe(404);
  });
});

describe('createRestRoutes: entities', () => {
  test('Should match config by entities "includes" behavior', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server)
      .get('/users')
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should match config by entities "includes" behavior with path regexp', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: /^\/us(.+?)rs$/,
            method: 'get',
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

    const response = await request(server)
      .get('/users')
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should give priority to more specific route config', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server)
      .get('/users')
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Smith' });
  });

  test('Should strictly compare plain array body if top level descriptor used', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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

    const successResponse = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send([{ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } }]);
    expect(successResponse.statusCode).toBe(200);
    expect(successResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

    const failedResponse = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send([{ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }]);
    expect(failedResponse.statusCode).toBe(404);
  });

  test('Should strictly compare plain object body if top level descriptor used', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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

    const response = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should correctly resolve flat object body with descriptors', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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

    const response = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should be case-insensitive for header keys', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server)
      .get('/users')
      .set('Content-Type', 'application/json')
      .set({ LowerCase: 'lowercase', upperCase: 'UPPERCASE' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });
});

describe('createRestRoutes: interceptors', () => {
  test('Should call request interceptor', async () => {
    const requestInterceptor = jest.fn();
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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
            path: '/settings',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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

    await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(requestInterceptor.mock.calls.length).toBe(1);

    await request(server)
      .post('/settings')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(requestInterceptor.mock.calls.length).toBe(1);
  });

  test('Should call response interceptors in order: route -> request -> server', async () => {
    const routeInterceptor = jest.fn();
    const requestInterceptor = jest.fn();
    const serverInterceptor = jest.fn();
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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
            path: '/settings',
            method: 'post',
            routes: [
              {
                entities: {
                  body: {
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

    await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
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
      .post('/settings')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);

    await request(server)
      .post('/messages')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(routeInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);
  });
});
