import express from 'express';
import request from 'supertest';

import { createGraphQLRoutes } from '@/core/graphql';
import { createRestRoutes } from '@/core/rest';
import { urlJoin } from '@/utils/helpers';
import type { BaseUrl, MockServerConfig } from '@/utils/types';

import type { GraphqlRequestSuggestionConfigs } from './helpers/getGraphqlUrlSuggestions/getGraphqlUrlSuggestions';
import type { RestRequestSuggestionConfigs } from './helpers/getRestUrlSuggestions/getRestUrlSuggestions';
import { notFoundMiddleware } from './notFoundMiddleware';

const createServer = (
  mockServerConfig: Pick<MockServerConfig, 'rest' | 'graphql' | 'interceptors' | 'baseUrl'>
) => {
  const { baseUrl, rest, interceptors, graphql } = mockServerConfig;

  const server = express();

  const serverBaseUrl = baseUrl ?? '/';

  const restBaseUrl = urlJoin(serverBaseUrl, rest?.baseUrl ?? '/');
  const routerWithRestRoutes = createRestRoutes({
    router: express.Router(),
    restConfig: { configs: rest?.configs ?? [] },
    serverResponseInterceptor: interceptors?.response
  });
  server.use(restBaseUrl, routerWithRestRoutes);

  const graphqlBaseUrl = urlJoin(serverBaseUrl, graphql?.baseUrl ?? '/');
  const routerWithGraphqlRoutes = createGraphQLRoutes({
    router: express.Router(),
    graphqlConfig: { configs: graphql?.configs ?? [] },
    serverResponseInterceptor: interceptors?.response
  });
  server.use(graphqlBaseUrl, routerWithGraphqlRoutes);

  server.set('view engine', 'ejs');
  server.set('views', urlJoin(__dirname, '../../../static/views'));
  server.use(express.static(urlJoin(__dirname, '../../../static/views')));
  server.use(express.json());

  notFoundMiddleware(server, mockServerConfig);

  return server;
};

describe('notFoundMiddleware: HTML response', () => {
  const server = createServer({
    rest: {
      configs: [
        {
          path: '/posts',
          method: 'get',
          routes: [{ data: {} }]
        }
      ]
    },
    graphql: {
      configs: [
        {
          operationName: 'GetPosts',
          operationType: 'query',
          routes: [{ data: {} }]
        }
      ]
    }
  });

  test('Should send correct HTML REST response', async () => {
    const response = await request(server).get('/pstss').set('accept', 'text/html');

    expect(response.statusCode).toBe(404);
    expect(response.get('Content-Type')).toContain('text/html');
    expect(response.text).toContain('GET /posts');
  });

  test('Should send correct HTML GraphQL response', async () => {
    const response = await request(server)
      .get('/?query=query getPost { posts }')
      .set('accept', 'text/html');

    expect(response.statusCode).toBe(404);
    expect(response.get('Content-Type')).toContain('text/html');
    expect(response.text).toContain('query  GetPosts');
  });
});

interface ResponseBody {
  restRequestSuggestions?: RestRequestSuggestionConfigs;
  graphqlRequestSuggestions?: GraphqlRequestSuggestionConfigs;
}

const responseBody = ({
  restRequestSuggestions = [],
  graphqlRequestSuggestions = []
}: ResponseBody) => ({
  message: 'Request or page not found. Similar requests in data',
  data: {
    restRequestSuggestions,
    graphqlRequestSuggestions
  }
});

describe('notFoundMiddleware: REST', () => {
  const serverBaseUrl: BaseUrl = '/base';
  const restBaseUrl: BaseUrl = '/rest';
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
        routes: [{ data: {}, entities: { params: { postId: '1' } } }]
      },

      {
        path: '/developers',
        method: 'post',
        routes: [{ data: {} }]
      },
      {
        path: '/developers/:developerId',
        method: 'post',
        routes: [{ data: {}, entities: { params: { developerId: '1' } } }]
      }
    ]
  };

  test('Should send correct REST suggestions', async () => {
    const server = createServer({
      rest
    });

    const response = await request(server).get('/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({ restRequestSuggestions: [{ path: '/posts', method: 'get' }] })
    );
  });

  test('Should send correct REST suggestions with serverBaseUrl', async () => {
    const server = createServer({
      baseUrl: serverBaseUrl,
      rest
    });

    const response = await request(server).get('/bas/dveloprs');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({ restRequestSuggestions: [{ path: '/base/developers', method: 'post' }] })
    );
  });

  test('Should send correct REST suggestions with restBaseUrl', async () => {
    const server = createServer({
      rest: {
        ...rest,
        baseUrl: restBaseUrl
      }
    });

    const response = await request(server).get('/res/pstss');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({ restRequestSuggestions: [{ path: '/rest/posts', method: 'get' }] })
    );
  });

  test('Should send correct REST suggestions with serverBaseUrl and restBaseUrl', async () => {
    const server = createServer({
      baseUrl: serverBaseUrl,
      rest: {
        ...rest,
        baseUrl: restBaseUrl
      }
    });

    const response = await request(server).get('/bas/res/post');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({ restRequestSuggestions: [{ path: '/base/rest/posts', method: 'get' }] })
    );
  });
});

describe('notFoundMiddleware: GraphQL', () => {
  const serverBaseUrl: MockServerConfig['baseUrl'] = '/base';
  const graphqlBaseUrl: BaseUrl = '/graphql';

  const graphql: MockServerConfig['graphql'] = {
    configs: [
      {
        operationName: 'GetPosts',
        operationType: 'query',
        routes: [{ data: {} }]
      },
      {
        operationName: 'GetDevelopers',
        operationType: 'mutation',
        routes: [{ data: {} }]
      }
    ]
  };

  test('Should send correct GraphQL suggestions', async () => {
    const server = createServer({
      graphql
    });

    const response = await request(server).get('/?query=query getPost { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({
        graphqlRequestSuggestions: [{ operationName: ' GetPosts', operationType: 'query' }]
      })
    );
  });

  test('Should send correct GraphQL suggestions with serverBaseUrl', async () => {
    const server = createServer({
      baseUrl: serverBaseUrl,
      graphql
    });

    const response = await request(server).get('/bse?query=query developers { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({
        graphqlRequestSuggestions: [
          { operationName: '/base GetDevelopers', operationType: 'mutation' }
        ]
      })
    );
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
    expect(response.body).toStrictEqual(
      responseBody({
        graphqlRequestSuggestions: [{ operationName: '/graphql GetPosts', operationType: 'query' }]
      })
    );
  });

  test('Should send correct GraphQL suggestions with serverBaseUrl and graphqlBaseUrl', async () => {
    const server = createServer({
      baseUrl: serverBaseUrl,
      graphql: {
        ...graphql,
        baseUrl: graphqlBaseUrl
      }
    });

    const response = await request(server).get('/bas/graphq?query=query posts { posts }');

    expect(response.statusCode).toBe(404);
    expect(response.body).toStrictEqual(
      responseBody({
        graphqlRequestSuggestions: [
          { operationName: '/base/graphql GetPosts', operationType: 'query' }
        ]
      })
    );
  });
});
