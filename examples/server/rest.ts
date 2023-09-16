import type { RestMockServerConfig } from 'mock-config-server';
import { createRestMockServer, startRestMockServer } from 'mock-config-server';

export const restMockServerConfig: RestMockServerConfig = {
  baseUrl: '/api',
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
};

createRestMockServer(restMockServerConfig);
startRestMockServer(restMockServerConfig);
