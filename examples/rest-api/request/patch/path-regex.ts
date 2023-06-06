import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'patch',
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
        method: 'patch',
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
