import express from 'express';
import request from 'supertest';

import { urlJoin } from '../../utils/helpers';
import type { MockServerConfig } from '../../utils/types';

import { createRestRoutes } from './createRestRoutes';

describe('createRestRoutes', () => {
  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'rest' | 'interceptors' | 'baseUrl'>
  ) => {
    const server = express();
    const routerBase = express.Router();
    const routerWithRoutes = createRestRoutes(
      routerBase,
      mockServerConfig.rest?.configs ?? [],
      mockServerConfig.interceptors
    );

    const restBaseUrl = urlJoin(
      mockServerConfig.baseUrl ?? '/',
      mockServerConfig.rest?.baseUrl ?? '/'
    );

    server.use(express.json());
    server.use(restBaseUrl, routerWithRoutes);
    return server;
  };

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

    const response = await request(server)
      .get('/users')
      .set({ key1: 'value1', key2: 'value2' })
      .query({ key1: 'value1', key2: 'value2' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Smith' });
  });

  test('Should return 404 and description text for no matched request configs', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'get',
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

    const response = await request(server).get('/users').set({ key2: 'value2' });

    expect(response.statusCode).toBe(404);
  });

  test('Should compare non plain object body by full equal behavior', async () => {
    const server = createServer({
      rest: {
        configs: [
          {
            path: '/users',
            method: 'post',
            routes: [
              {
                entities: {
                  body: [
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

  test('Should compare plain object body by "includes" behavior', async () => {
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

    const response = await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
  });

  test('Should call request interceptors in order: request -> server', async () => {
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
      },
      interceptors: { request: serverInterceptor }
    });

    await request(server)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);
    expect(requestInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );

    await request(server)
      .post('/settings')
      .set('Content-Type', 'application/json')
      .send({ key1: 'value1', key2: 'value2' });
    expect(requestInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(2);
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
