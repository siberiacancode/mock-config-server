import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'options',
        path: /^\/us(.+?)rs$/,
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

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
