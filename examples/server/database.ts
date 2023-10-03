import type { DatabaseMockServerConfig } from 'mock-config-server';
import { createDatabaseMockServer, startDatabaseMockServer } from 'mock-config-server';

export const databaseMockServerConfig: DatabaseMockServerConfig = {
  baseUrl: '/api',
  data: {
    users: [{ id: 1, emoji: '🎉' }]
  },
  routes: {
    '/*/users/:id': '/api/users/:id'
  }
};

createDatabaseMockServer(databaseMockServerConfig);
startDatabaseMockServer(databaseMockServerConfig);
