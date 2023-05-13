import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'post',
        path: '/users',
        routes: [
          {
            data: 'default'
          },
          {
            data: 'entities',
            entities: {
              headers: {
                header: 'header'
              },
              query: {
                query: 'query'
              },
              body: {
                body: 'body'
              }
            }
          }
        ]
      },
      {
        method: 'post',
        path: '/users/:param',
        routes: [
          {
            data: 'entities',
            entities: {
              params: {
                param: 'param'
              }
            }
          }
        ]
      }
    ]
  }
};
