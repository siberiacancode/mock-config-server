import express from 'express';
import request from 'supertest';

import { createGraphQLRoutes } from '../graphql/createGraphQLRoutes/createGraphQLRoutes';
import { createRestRoutes } from '../rest/createRestRoutes/createRestRoutes';
import { urlJoin } from '../utils/helpers';
import type { MockServerConfig } from '../utils/types';

import { notFoundMiddleware } from './notFoundMiddleware';

describe('notFoundMiddleware', () => {
  const baseUrl: MockServerConfig['baseUrl'] = '/base';

  const rest: MockServerConfig['rest'] = {
    baseUrl: '/rest',
    configs: [
      {
        path: '/posts',
        method: 'get',
        routes: [{ data: {} }]
      },
      {
        path: '/posts/:postId',
        method: 'get',
        routes: [{ data: {}, entities: { params: { postId: 1 } } }]
      },

      {
        path: '/developers',
        method: 'get',
        routes: [{ data: {} }]
      },
      {
        path: '/developers/:developerId',
        method: 'get',
        routes: [{ data: {}, entities: { params: { developerId: 1 } } }]
      }
    ]
  };

  const graphql: MockServerConfig['graphql'] = {
    baseUrl: '/graphql',
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
      rest?.configs ?? [],
      interceptors
    );
    server.use(restBaseUrl, routerWithRestRoutes);

    const graphqlBaseUrl = urlJoin(serverBaseUrl, graphql?.baseUrl ?? '/');
    const routerWithGraphqlRoutes = createGraphQLRoutes(
      express.Router(),
      graphql?.configs ?? [],
      interceptors
    );
    server.use(graphqlBaseUrl, routerWithGraphqlRoutes);

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
      baseUrl,
      rest,
      graphql
    });

    const response = await request(server).get('/bas/rst/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>REST</h3>');
    expect(response.text).toContain('/base/rest/posts');
  });

  test('Should send correct GraphQL suggestions', async () => {
    const server = createServer({
      baseUrl,
      rest,
      graphql
    });

    const response = await request(server).get('/bse/graql?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.text).toContain('<h3>GraphQL</h3>');
    expect(response.text).toContain('/base/graphql/GetPosts');
  });
});
