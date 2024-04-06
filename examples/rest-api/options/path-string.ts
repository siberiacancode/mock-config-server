import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

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
            data: { success: false },
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

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
