import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  cors: {
    // origin: () => new Promise((res) => 'https://www.google.com')
    // origin: () => 'https://www.google.com'
    // origin: ['https://www.google.com']
    origin: 'https://www.google.com',
    methods: ['GET'],
    allowedHeaders: ['accept'],
    exposedHeaders: ['accept'],
    maxAge: 3600,
    credentials: true
  },
  graphql: {
    configs: [
      {
        operationType: 'query',
        operationName: 'GetUsers',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          }
        ]
      },
      {
        operationType: 'mutation',
        operationName: 'CreateUser',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          }
        ]
      },
      {
        operationType: 'mutation',
        operationName: 'DeleteUser',
        routes: [
          {
            data: { succes: true }
          }
        ]
      },
      {
        operationType: 'mutation',
        operationName: 'ChangeUser',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          }
        ]
      }
    ]
  }
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
