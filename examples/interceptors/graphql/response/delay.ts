import type { FlatMockServerConfig } from 'mock-config-server';
import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    interceptors: {
      response: async (data, params) => {
        await params.setDelay(1000);
        return data;
      }
    }
  },
  {
    configs: [
      {
        operationType: 'query',
        operationName: 'GetUsers',
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
