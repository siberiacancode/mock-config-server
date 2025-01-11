import type { FlatMockServerConfig } from 'mock-config-server';
import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    interceptors: {
      request: async (params) => {
        await params.setDelay(1000);
      }
    }
  },
  {
    configs: [
      {
        method: 'get',
        path: '/users',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          }
        ]
      }
    ]
  }
];

createFlatMockServer(mockServerConfig);
startFlatMockServer(mockServerConfig);
