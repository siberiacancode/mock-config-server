import type { MockServerConfig } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'options',
        path: '/users',
        routes: [
          {
            data: { success: true }
          },
          {
            data: { succes: false },
            entities: {
              headers: {
                cors: true
              }
            }
          }
        ]
      }
    ]
  }
};
