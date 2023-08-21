import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'put',
        path: '/users/:id',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          },
          {
            data: [{ id: 2, emoji: '🔥' }],
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
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
