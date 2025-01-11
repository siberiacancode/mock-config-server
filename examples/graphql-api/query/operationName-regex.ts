import type { FlatMockServerConfig } from 'mock-config-server';
import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    configs: [
      {
        operationType: 'query',
        operationName: /Get(Users|Accounts)/,
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          },
          {
            data: [{ id: 2, emoji: '🔥' }],
            entities: {
              query: {
                emoji: '🔥'
              }
            }
          }
        ]
      },
      {
        operationType: 'query',
        operationName: /Get(User|Account)/,
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          },
          {
            data: { id: 2, emoji: '🔥' },
            entities: {
              variables: {
                id: 2
              }
            }
          }
        ]
      }
    ]
  }
];

createFlatMockServer(mockServerConfig);
startFlatMockServer(mockServerConfig);
