import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  interceptors: {
    response: (data, params) => {
      console.log(data);
      console.log(params.getHeaders());
      return data;
    }
  },
  graphql: {
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
