import type { FlatMockServerConfig } from 'mock-config-server';

import { createFlatMockServer, startFlatMockServer } from 'mock-config-server';

export const mockServerConfig: FlatMockServerConfig = [
  {
    configs: [
      {
        operationType: 'query',
        operationName: 'GetUsers',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          }
        ],
        interceptors: {
          request: (params) => {
            console.log(params.getHeaders());
          }
        }
      }
    ]
  }
];

createFlatMockServer(mockServerConfig);
startFlatMockServer(mockServerConfig);
