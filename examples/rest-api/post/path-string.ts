import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'post',
        path: '/users',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          },
          {
            data: [{ id: 2, emoji: '🔥' }],
            entities: {
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
