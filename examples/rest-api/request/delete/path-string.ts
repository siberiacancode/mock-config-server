import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'delete',
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
              }
            }
          }
        ]
      },
      {
        method: 'delete',
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

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
