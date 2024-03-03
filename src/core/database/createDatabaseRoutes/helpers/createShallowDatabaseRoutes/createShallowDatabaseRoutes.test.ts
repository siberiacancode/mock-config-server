import type { Express } from 'express';
import express from 'express';
import request from 'supertest';

import type { ShallowDatabase } from '@/utils/types';

import { MemoryStorage } from '../../storages';

import { createShallowDatabaseRoutes } from './createShallowDatabaseRoutes';

describe('createShallowDatabaseRoutes', () => {
  const createShallowDatabase = () => ({
    john: { name: 'John Doe', age: 25 },
    jane: { name: 'Jane Smith', age: 30 }
  });

  const createServer = (shallowDatabase: ShallowDatabase) => {
    const server = express();
    const routerBase = express.Router();
    const storage = new MemoryStorage(shallowDatabase);

    const routerWithRoutesForShallowDatabase = createShallowDatabaseRoutes(
      routerBase,
      shallowDatabase,
      storage
    );

    server.use(express.json());
    server.use(express.text());
    server.use('/', routerWithRoutesForShallowDatabase);

    return server;
  };

  describe('createShallowDatabaseRoutes: GET method', () => {
    const shallowDatabase = createShallowDatabase();
    const server = createServer(shallowDatabase);

    test('Should return correct data for valid key', async () => {
      const response = await request(server).get('/john');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual(shallowDatabase.john);
    });

    test('Should return correct Cache-Control header for valid key', async () => {
      const response = await request(server).get('/john');

      expect(response.headers['cache-control']).toBe('no-cache');
    });
  });

  describe('createShallowDatabaseRoutes: POST method', () => {
    let shallowDatabase: ReturnType<typeof createShallowDatabase>;
    let server: Express;
    beforeEach(() => {
      shallowDatabase = createShallowDatabase();
      server = createServer(shallowDatabase);
    });

    test('Should return correct data for valid key and successfully update database', async () => {
      const newJohnInfo = { age: 26, standName: 'The World' };

      const postResponse = await request(server).post('/john').send(newJohnInfo);
      expect(postResponse.statusCode).toBe(201);
      expect(postResponse.body).toStrictEqual(newJohnInfo);

      const getResponse = await request(server).get('/john');
      expect(getResponse.body).toStrictEqual(newJohnInfo);
    });

    test('Should return correct Location header for valid key', async () => {
      const response = await request(server).post('/john').send(undefined);

      expect(response.headers.location).toBe('/john');
    });
  });

  describe('createShallowDatabaseRoutes: PUT method', () => {
    let shallowDatabase: ReturnType<typeof createShallowDatabase>;
    let server: Express;
    beforeEach(() => {
      shallowDatabase = createShallowDatabase();
      server = createServer(shallowDatabase);
    });

    test('Should return correct data for valid key and successfully update database', async () => {
      const newJohnInfo = { age: 26, standName: 'The World' };

      const putResponse = await request(server).put('/john').send(newJohnInfo);
      expect(putResponse.statusCode).toBe(200);
      expect(putResponse.body).toStrictEqual(newJohnInfo);

      const getResponse = await request(server).get('/john');
      expect(getResponse.body).toStrictEqual(newJohnInfo);
    });
  });

  describe('createShallowDatabaseRoutes: PATCH method', () => {
    let shallowDatabase: ReturnType<typeof createShallowDatabase>;
    let server: Express;
    beforeEach(() => {
      shallowDatabase = createShallowDatabase();
      server = createServer(shallowDatabase);
    });

    test('Should return correct data for valid key and successfully update database', async () => {
      const newJohnInfo = { age: 26, standName: 'The World' };

      const patchResponse = await request(server).patch('/john').send(newJohnInfo);
      expect(patchResponse.statusCode).toBe(200);
      expect(patchResponse.body).toStrictEqual({ ...shallowDatabase.john, ...newJohnInfo });

      const getResponse = await request(server).get('/john');
      expect(getResponse.body).toStrictEqual({ ...shallowDatabase.john, ...newJohnInfo });
    });
  });
});
