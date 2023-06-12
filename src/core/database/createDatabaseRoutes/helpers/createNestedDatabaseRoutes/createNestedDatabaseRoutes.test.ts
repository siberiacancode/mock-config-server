import type { Express } from 'express';
import express from 'express';
import request from 'supertest';

import type { NestedDatabase } from '@/utils/types';

import { MemoryStorage } from '../../storages';

import { createNestedDatabaseRoutes } from './createNestedDatabaseRoutes';

describe('CreateNestedDatabaseRoutes', () => {
  const createNestedDatabase = () => ({
    users: [
      { id: 1, name: 'John Doe', age: 25 },
      { id: 2, name: 'Jane Smith', age: 30 }
    ]
  });

  const createServer = (nestedDatabase: NestedDatabase) => {
    const server = express();
    const routerBase = express.Router();
    const storage = new MemoryStorage(nestedDatabase);

    const routerWithNestedDatabaseRoutes = createNestedDatabaseRoutes(
      routerBase,
      nestedDatabase,
      storage
    );

    server.use(express.json());
    server.use(express.text());
    server.use('/', routerWithNestedDatabaseRoutes);

    return server;
  };

  describe('createNestedDatabaseRoutes: get method for collection', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return correct data for valid key', async () => {
      const response = await request(server).get('/users');

      expect(response.body).toStrictEqual(nestedDatabase.users);
    });

    test('Should return correct Cache-Control header for valid key', async () => {
      const response = await request(server).get('/users');

      expect(response.headers['cache-control']).toBe('max-age=0, must-revalidate');
    });
  });

  describe('createNestedDatabaseRoutes: post method for collection', () => {
    let nestedDatabase: ReturnType<typeof createNestedDatabase>;
    let server: Express;
    beforeEach(() => {
      nestedDatabase = createNestedDatabase();
      server = createServer(nestedDatabase);
    });

    test('Should return correct data (ignored id) for valid key and successfully update database', async () => {
      const jim = { id: 4, name: 'jim', age: 35 };
      const postResponse = await request(server).post('/users').send(jim);

      expect(postResponse.statusCode).toBe(201);
      expect(postResponse.body).toStrictEqual({ ...jim, id: 3 });

      const getResponse = await request(server).get('/users');
      expect(getResponse.body).toContainEqual({ ...jim, id: 3 });
    });

    test('Should return correct Location header for valid key', async () => {
      const jim = { id: 4, name: 'jim', age: 35 };
      const postResponse = await request(server).post('/users').send(jim);

      expect(postResponse.headers.location).toBe('/users/3');
    });
  });
});
