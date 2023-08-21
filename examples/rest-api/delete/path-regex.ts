import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'delete',
        path: '/users?/:id',
        routes: [
          {
            data: { succes: true }
          },
          {
            data: { succes: false },
            entities: {
              params: {
                id: 2
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
