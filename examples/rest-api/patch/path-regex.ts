import type { FlatMockServerConfig } from 'mock-config-server';
import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    configs: [
      {
        method: 'patch',
        path: '/users?/:id',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          },
          {
            data: { id: 2, emoji: '🔥' },
            entities: {
              params: {
                id: 2
              },
              body: {
                emoji: '🔥'
              }
            }
          }
        ]
      },
      {
        method: 'patch',
        path: /\/users?\/\d+/,
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          },
          {
            data: { id: 2, emoji: '🔥' },
            entities: {
              params: {
                id: 2
              },
              body: {
                emoji: '🔥'
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
