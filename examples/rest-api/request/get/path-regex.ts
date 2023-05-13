import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'get',
        path: /^\/us(.+?)rs$/,
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
              }
            }
          }
        ]
      },
      {
        method: 'get',
        path: '/users/:param([\\s\\S]*)',
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
