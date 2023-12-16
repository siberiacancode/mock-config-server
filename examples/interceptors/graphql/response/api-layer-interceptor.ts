import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  graphql: {
    interceptors: {
      response: (data, params) => {
        console.log(data);
        console.log(params.getHeaders());
        return data;
      }
    },
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
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
