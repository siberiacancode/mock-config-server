import express from 'express';
import request from 'supertest';

import { createGraphQLRoutes } from '@/core/graphql';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type { BaseUrl, MockServerConfig } from '@/utils/types';

import { notFoundMiddleware } from './notFoundMiddleware';

describe('notFoundMiddleware', () => {
  const rest: MockServerConfig['rest'] = {
    configs: [
      {
        path: '/posts',
        method: 'get',
        routes: [{ data: {} }]
      },
      {
        path: '/posts/:postId',
        method: 'get',
        routes: [
          {
            data: {},
            entities: {
              params: {
                postId: {
                  checkMode: 'equals',
                  value: 1
                }
              }
            }
          }
        ]
      },

      {
        path: '/developers',
        method: 'get',
        routes: [
          {
            data: {}
          }
        ]
      },
      {
        path: '/developers/:developerId',
        method: 'get',
        routes: [
          {
            data: {},
            entities: {
              params: {
                developerId: {
                  checkMode: 'equals',
                  value: 1
                }
              }
            }
          }
        ]
      }
    ]
  };

  const graphql: MockServerConfig['graphql'] = {
    configs: [
      {
        operationName: 'GetPosts',
        operationType: 'query',
        routes: [{ data: {} }]
      },
      {
        operationName: 'GetDevelopers',
        operationType: 'query',
        routes: [{ data: {} }]
      }
    ]
  };

  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'rest' | 'graphql' | 'interceptors' | 'baseUrl'>
  ) => {
    const { baseUrl, rest, interceptors, graphql } = mockServerConfig;

    const server = express();

    const serverBaseUrl = baseUrl ?? '/';

    const restBaseUrl = urlJoin(serverBaseUrl, rest?.baseUrl ?? '/');
    const routerWithRestRoutes = createRestRoutes(
      express.Router(),
      rest ?? { configs: [] },
      interceptors?.response
    );
    server.use(restBaseUrl, routerWithRestRoutes);

    const graphqlBaseUrl = urlJoin(serverBaseUrl, graphql?.baseUrl ?? '/');
    const routerWithGraphqlRoutes = createGraphQLRoutes(
      express.Router(),
      graphql ?? { configs: [] },
      interceptors?.response
    );
    server.use(graphqlBaseUrl, routerWithGraphqlRoutes);

    server.set('views', urlJoin(__dirname, '../../../static/views'));
    server.set('view engine', 'ejs');
    server.use(express.json());

    notFoundMiddleware({
      server,
      mockServerConfig
    });

    return server;
  };

  test('Should send correct REST suggestions', async () => {
    const server = createServer({
      rest
    });

    const response = await request(server).get('/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>REST</h3>');
    expect(response.text).toContain('/posts');
  });

  test('Should send correct GraphQL suggestions', async () => {
    const server = createServer({
      graphql
    });

    const response = await request(server).get('?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>GraphQL</h3>');
    expect(response.text).toContain('/GetPosts');
  });

  const baseUrl: MockServerConfig['baseUrl'] = '/base';

  test('Should send correct REST suggestions with serverBaseUrl', async () => {
    const server = createServer({
      baseUrl,
      rest
    });

    const response = await request(server).get('/bas/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>REST</h3>');
    expect(response.text).toContain('/base/posts');
  });

  test('Should send correct GraphQL suggestions with serverBaseUrl', async () => {
    const server = createServer({
      baseUrl,
      graphql
    });

    const response = await request(server).get('/bse?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>GraphQL</h3>');
    expect(response.text).toContain('/base/GetPosts');
  });

  const restBaseUrl: BaseUrl = '/rest';
  const graphqlBaseUrl: BaseUrl = '/graphql';

  test('Should send correct REST suggestions with restBaseUrl', async () => {
    const server = createServer({
      rest: {
        ...rest,
        baseUrl: restBaseUrl
      }
    });

    const response = await request(server).get('/res/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>REST</h3>');
    expect(response.text).toContain('/rest/posts');
  });

  test('Should send correct GraphQL suggestions with graphqlBaseUrl', async () => {
    const server = createServer({
      graphql: {
        ...graphql,
        baseUrl: graphqlBaseUrl
      }
    });

    const response = await request(server).get('/graph?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>GraphQL</h3>');
    expect(response.text).toContain('/graphql/GetPosts');
  });

  test('Should send correct REST suggestions with serverBaseUrl and restBaseUrl', async () => {
    const server = createServer({
      baseUrl,
      rest: {
        ...rest,
        baseUrl: restBaseUrl
      }
    });

    const response = await request(server).get('/bas/res/post');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>REST</h3>');
    expect(response.text).toContain('/base/rest/posts');
  });

  test('Should send correct GraphQL suggestions with serverBaseUrl and graphqlBaseUrl', async () => {
    const server = createServer({
      baseUrl,
      graphql: {
        ...graphql,
        baseUrl: graphqlBaseUrl
      }
    });

    const response = await request(server).get('/bas/graphq?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>GraphQL</h3>');
    expect(response.text).toContain('/base/graphql/GetPosts');
  });
});
