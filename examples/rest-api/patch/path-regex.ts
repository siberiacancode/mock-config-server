import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'patch',
        path: '/users/:id([\\s\\S]*)',
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
