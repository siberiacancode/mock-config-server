import * as fs from 'fs';

import express from 'express';
import request from 'supertest';

import { createDatabaseRoutes } from '@/core/database';
import { findIndexById } from '@/utils/helpers';
import type { MockServerConfig, DatabaseConfig } from '@/utils/types';

jest.mock('fs');

describe('createDatabaseRoutes', () => {
  const createServer = (
    mockServerConfig: Pick<MockServerConfig, 'baseUrl'> & { database: DatabaseConfig }
  ) => {
    const server = express();
    const routerBase = express.Router();
    const routesWithDatabaseRoutes = createDatabaseRoutes(routerBase, mockServerConfig.database);

    server.use(mockServerConfig.baseUrl ?? '/', routesWithDatabaseRoutes);
    return server;
  };

  describe('createDatabaseRoutes: routes and data successfully works when passing them by object', () => {
    const data = { profile: { name: 'John' }, users: [{ id: 1 }, { id: 2 }] };
    const routes = { '/api/profile': '/profile' } as const;
    const server = createServer({ database: { data, routes } });

    test('Should overwrite routes according to routes object (but default url should work too)', async () => {
      const overwrittenUrlResponse = await request(server).get('/api/profile');
      expect(overwrittenUrlResponse.body).toStrictEqual(data.profile);

      const defaultUrlResponse = await request(server).get('/profile');
      expect(defaultUrlResponse.body).toStrictEqual(data.profile);
    });

    test('Should successfully handle requests to shallow and nested database parts', async () => {
      const shallowDatabaseResponse = await request(server).get('/profile');
      expect(shallowDatabaseResponse.body).toStrictEqual(data.profile);

      const nestedDatabaseCollectionResponse = await request(server).get('/users');
      expect(nestedDatabaseCollectionResponse.body).toStrictEqual(data.users);

      const nestedDatabaseItemResponse = await request(server).get('/users/1');
      expect(nestedDatabaseItemResponse.body).toStrictEqual(
        data.users[findIndexById(data.users, 1)]
      );
    });
  });

  describe('createDatabaseRoutes: routes and data successfully works when passing them by file', () => {
    const data = { profile: { name: 'John' }, users: [{ id: 1 }, { id: 2 }] };
    const routes = { '/api/profile': '/profile' } as const;
    (fs as jest.Mocked<typeof fs>).readFileSync.mockImplementation((filename) => {
      if ((filename as string).endsWith('data.json')) return JSON.stringify(data);
      if ((filename as string).endsWith('routes.json')) return JSON.stringify(routes);
      throw new Error('Error with mocking fs.readFileSync');
    });
    const server = createServer({ database: { data: 'data.json', routes: 'routes.json' } });

    afterAll(() => {
      (fs as jest.Mocked<typeof fs>).readFileSync.mockClear();
    });

    test('Should overwrite routes according to routes object (but default url should work too)', async () => {
      const overwrittenUrlResponse = await request(server).get('/api/profile');
      expect(overwrittenUrlResponse.body).toStrictEqual(data.profile);

      const defaultUrlResponse = await request(server).get('/profile');
      expect(defaultUrlResponse.body).toStrictEqual(data.profile);
    });

    test('Should successfully handle requests to shallow and nested database parts', async () => {
      const shallowDatabaseResponse = await request(server).get('/profile');
      expect(shallowDatabaseResponse.body).toStrictEqual(data.profile);

      const nestedDatabaseCollectionResponse = await request(server).get('/users');
      expect(nestedDatabaseCollectionResponse.body).toStrictEqual(data.users);

      const nestedDatabaseItemResponse = await request(server).get('/users/1');
      expect(nestedDatabaseItemResponse.body).toStrictEqual(
        data.users[findIndexById(data.users, 1)]
      );
    });
  });

  describe('createDatabaseRoutes: routes /__routes and /__db', () => {
    const data = { profile: { name: 'John' }, users: [{ id: 1 }, { id: 2 }] };
    const routes = { '/api/profile': '/profile' } as const;
    const server = createServer({ database: { data, routes } });

    test('Should create /__db route that return data from databaseConfig', async () => {
      const response = await request(server).get('/__db');
      expect(response.body).toStrictEqual(data);
    });

    test('Should create /__routes route that return routes from databaseConfig', async () => {
      const response = await request(server).get('/__routes');
      expect(response.body).toStrictEqual(routes);
    });
  });
});
