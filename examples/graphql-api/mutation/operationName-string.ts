import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  graphql: {
    configs: [
      {
        operationType: 'mutation',
        operationName: 'CreateUser',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          },
          {
            data: { id: 2, emoji: '🔥' },
            entities: {
              variables: {
                emoji: '🔥'
              }
            }
          }
        ]
      },
      {
        operationType: 'mutation',
        operationName: 'DeleteUser',
        routes: [
          {
            data: { succes: true }
          },
          {
            data: { succes: false },
            entities: {
              variables: {
                id: 2
              }
            }
          }
        ]
      },
      {
        operationType: 'mutation',
        operationName: 'ChangeUser',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          },
          {
            data: { id: 2, emoji: '🔥' },
            entities: {
              variables: {
                id: 2,
                emoji: '🔥'
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
