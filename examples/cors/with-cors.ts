import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

// ✅ important:
// All information about cors settings here (https://github.com/siberiacancode/mock-config-server#cors)

export const mockServerConfig: MockServerConfig = {
  cors: {
    origin: 'https://test.com',
    methods: ['GET'],
    allowedHeaders: ['header'],
    exposedHeaders: ['header'],
    maxAge: 3600,
    credentials: true
  },
  rest: {
    configs: [
      {
        method: 'get',
        path: '/users',
        routes: [
          {
            data: 'default'
          }
        ]
      }
    ]
  },
  graphql: {
    configs: [
      {
        operationType: 'query',
        operationName: 'GetUsers',
        routes: [
          {
            data: 'default'
          }
        ]
      }
    ]
  }
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
