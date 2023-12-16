import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    interceptors: {
      response: (data, params) => {
        console.log(data);
        console.log(params.getHeaders());
        return data;
      }
    },
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
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
