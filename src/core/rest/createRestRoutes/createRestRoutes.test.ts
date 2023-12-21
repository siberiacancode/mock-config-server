import express from 'express';
import request from 'supertest';

import { urlJoin } from '@/utils/helpers';
import type { MockServerConfig, RestConfig } from '@/utils/types';

import { createRestRoutes } from './createRestRoutes';

describe('createRestRoutes', () => {
  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'interceptors' | 'baseUrl'> & {
      rest: RestConfig;
    }
  ) => {
    const server = express();

    const routerBase = express.Router();
    const routerWithRoutes = createRestRoutes(
      routerBase,
      mockServerConfig.rest,
      mockServerConfig.interceptors?.response
    );

    const restBaseUrl = urlJoin(
      mockServerConfig.baseUrl ?? '/',
      mockServerConfig.rest?.baseUrl ?? '/'
    );

    server.use(express.json());
    server.use(restBaseUrl, routerWithRoutes);
    return server;
  };

  describe('createRestRoutes: notFoundConfig', () => {
    test('Should return 404 for no matched by entities request configs', async () => {
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
  });

  describe('createRestRoutes: match route', () => {
    test('Should match route by entities "includes" behavior', async () => {
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

    test('Should give priority to more specific route', async () => {
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
  });

  describe('createRestRoutes: top level array body', () => {
    test('Should iterate over top level array body and compare with each element', async () => {
      const server = createServer({
        rest: {
          configs: [
            {
              path: '/users',
              method: 'post',
              routes: [
                {
                  entities: {
                    body: [{ key1: 'value1' }, ['value1', 'value2']]
                  },
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const successResponse = await request(server).post('/users').send(['value1', 'value2']);
      expect(successResponse.statusCode).toBe(200);
      expect(successResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const notFoundResponse = await request(server).post('/users');
      expect(notFoundResponse.statusCode).toBe(404);
    });
  });

  describe('createRestRoutes: descriptors', () => {
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

      const notFoundResponse = await request(server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send([
          { key1: 'value1', key2: { nestedKey1: 'nestedValue1', nestedKey2: 'nestedValue2' } }
        ]);
      expect(notFoundResponse.statusCode).toBe(404);
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

      const successResponse = await request(server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({ key1: 'value1', key2: { nestedKey1: 'nestedValue1' } });
      expect(successResponse.statusCode).toBe(200);
      expect(successResponse.body).toStrictEqual({ name: 'John', surname: 'Doe' });

      const notFoundResponse = await request(server)
        .post('/users')
        .set('Content-Type', 'application/json')
        .send({ key1: 'value1', key2: { nestedKey1: 'nestedValue1' }, key3: 'value3' });
      expect(notFoundResponse.statusCode).toBe(404);
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
  });

  describe('createRestRoutes: interceptors', () => {
    test('Should call request interceptor for specific config', async () => {
      const requestInterceptor = jest.fn();
      const server = createServer({
        rest: {
          configs: [
            {
              path: '/users',
              method: 'post',
              routes: [
                {
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
                  data: { name: 'John', surname: 'Smith' }
                }
              ]
            }
          ]
        }
      });

      await request(server).post('/users');
      expect(requestInterceptor.mock.calls.length).toBe(1);

      await request(server).post('/settings');
      expect(requestInterceptor.mock.calls.length).toBe(1);
    });

    test('Should call response interceptors in order: route -> request -> api -> server', async () => {
      const routeInterceptor = jest.fn();
      const requestInterceptor = jest.fn();
      const apiInterceptor = jest.fn();
      const serverInterceptor = jest.fn();

      const server = createServer({
        rest: {
          configs: [
            {
              path: '/users',
              method: 'post',
              routes: [
                {
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
                  data: { name: 'John', surname: 'Smith' }
                }
              ]
            }
          ],
          interceptors: { response: apiInterceptor }
        },
        interceptors: { response: serverInterceptor }
      });

      await request(server).post('/users');
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

      await request(server).post('/settings');
      expect(routeInterceptor.mock.calls.length).toBe(1);
      expect(requestInterceptor.mock.calls.length).toBe(1);
      expect(apiInterceptor.mock.calls.length).toBe(2);
      expect(serverInterceptor.mock.calls.length).toBe(2);

      await request(server).post('/messages');
      expect(routeInterceptor.mock.calls.length).toBe(1);
      expect(requestInterceptor.mock.calls.length).toBe(1);
      expect(apiInterceptor.mock.calls.length).toBe(2);
      expect(serverInterceptor.mock.calls.length).toBe(2);
    });
  });

  describe('createRestRoutes: data function', () => {
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
  });

  describe('createRestRoutes: browser specific', () => {
    test('Should have response Cache-Control header with max-age=0, must-revalidate value', async () => {
      const server = createServer({
        rest: {
          configs: [
            {
              path: '/users',
              method: 'get',
              routes: [
                {
                  data: { name: 'John', surname: 'Doe' }
                }
              ]
            }
          ]
        }
      });

      const response = await request(server).get('/users');
      expect(response.headers['cache-control']).toBe('max-age=0, must-revalidate');
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
        .set({ LowerCase: 'lowercase', upperCase: 'UPPERCASE' });
      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual({ name: 'John', surname: 'Doe' });
    });
  });
});
