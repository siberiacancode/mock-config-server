import type { MockServerConfig } from 'mock-config-server';
import { createMockServer, startMockServer } from 'mock-config-server';

export const mockServerConfig: MockServerConfig = {
  rest: {
    configs: [
      {
        method: 'get',
        path: '/users',
        routes: [
          {
            data: [{ id: 1, emoji: '🎉' }]
          }
        ]
      },
      {
        method: 'delete',
        path: '/users/:id',
        routes: [
          {
            data: { succes: true }
          }
        ]
      },
      {
        method: 'options',
        path: '/users',
        routes: [
          {
            data: { success: true }
          }
        ]
      },
      {
        method: 'patch',
        path: '/users/:id',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          }
        ]
      },
      {
        method: 'post',
        path: '/users',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          }
        ]
      },
      {
        method: 'put',
        path: '/users?/:id',
        routes: [
          {
            data: { id: 1, emoji: '🎉' }
          }
        ]
      }
    ]
  }
};

createMockServer(mockServerConfig);
startMockServer(mockServerConfig);
