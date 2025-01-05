import type { Express } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';
import request from 'supertest';

import { createDatabaseRoutes } from '@/core/database';
import { urlJoin } from '@/utils/helpers';
import { createTmpDir } from '@/utils/helpers/tests';
import type { DatabaseConfig, MockServerConfig } from '@/utils/types';

import { findIndexById } from './helpers';

const createServer = (
  mockServerConfig: Pick<MockServerConfig, 'interceptors' | 'baseUrl'> & {
    database: DatabaseConfig;
  }
) => {
  const { baseUrl, database, interceptors } = mockServerConfig;
  const server = express();
  const routerBase = express.Router();
  const routesWithDatabaseRoutes = createDatabaseRoutes({
    router: routerBase,
    databaseConfig: database,
    serverResponseInterceptor: interceptors?.response
  });

  const databaseBaseUrl = urlJoin(baseUrl ?? '/', database?.baseUrl ?? '/');

  server.use(databaseBaseUrl, routesWithDatabaseRoutes);
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
    expect(nestedDatabaseItemResponse.body).toStrictEqual(data.users[findIndexById(data.users, 1)]);
  });
});

describe('createDatabaseRoutes: routes and data successfully works when passing them by file', () => {
  const data = { profile: { name: 'John' }, users: [{ id: 1 }, { id: 2 }] };
  const routes = { '/api/profile': '/profile' } as const;

  let tmpDirPath: string;
  let server: Express;

  beforeAll(() => {
    tmpDirPath = createTmpDir();

    const pathToData = path.join(tmpDirPath, './data.json') as `${string}.json`;
    fs.writeFileSync(pathToData, JSON.stringify(data));

    const pathToRoutes = path.join(tmpDirPath, './routes.json') as `${string}.json`;
    fs.writeFileSync(pathToRoutes, JSON.stringify(routes));

    server = createServer({ database: { data: pathToData, routes: pathToRoutes } });
  });

  afterAll(() => {
    fs.rmSync(tmpDirPath, { recursive: true, force: true });
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
    expect(nestedDatabaseItemResponse.body).toStrictEqual(data.users[findIndexById(data.users, 1)]);
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

describe('createDatabaseRoutes: interceptors', () => {
  test('Should call response interceptors in order: api -> server', async () => {
    const apiInterceptor = vi.fn();
    const serverInterceptor = vi.fn();

    const data = { profile: { name: 'John' }, users: [{ id: 1 }, { id: 2 }] };
    const routes = { '/api/profile': '/profile' } as const;
    const server = createServer({
      database: {
        data,
        routes,
        interceptors: {
          response: apiInterceptor
        }
      },
      interceptors: {
        response: serverInterceptor
      }
    });

    await request(server).get('/profile');

    expect(apiInterceptor.mock.calls.length).toBe(1);
    expect(serverInterceptor.mock.calls.length).toBe(1);
    expect(apiInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );
  });
});
