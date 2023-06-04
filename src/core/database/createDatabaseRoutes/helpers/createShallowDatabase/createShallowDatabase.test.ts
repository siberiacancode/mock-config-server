import type { Express } from 'express';
import express from 'express';
import request from 'supertest';

import type { ShallowDatabase } from '@/utils/types';

import { MemoryStorage } from '../../storages';

import { createShallowDatabase } from './createShallowDatabase';

describe('createShallowDatabase', () => {
  const shallowDatabase = {
    john: { name: 'John Doe', age: 25 },
    jane: { name: 'Jane Smith', age: 30 }
  };

  const createServer = (shallowDatabase: ShallowDatabase) => {
    const server = express();
    const routerBase = express.Router();
    const storage = new MemoryStorage(shallowDatabase);

    const routerWithRoutesForShallowDatabase = createShallowDatabase(
      routerBase,
      shallowDatabase,
      storage
    );

    server.use(express.json());
    server.use(express.text());
    server.use('/', routerWithRoutesForShallowDatabase);

    return server;
  };

  describe('createShallowDatabase: get method', () => {
    const server = createServer(shallowDatabase);

    test('Should return correct data for valid key', async () => {
      const response = await request(server).get('/john');

      expect(response.statusCode).toBe(200);
      expect(response.body).toStrictEqual(shallowDatabase.john);
    });

    test('Should return correct Cache-Control header for valid key', async () => {
      const response = await request(server).get('/john');

      expect(response.headers['cache-control']).toBe('max-age=0, must-revalidate');
    });
  });

  describe('createShallowDatabase: post method', () => {
    let server: Express;
    beforeEach(() => {
      server = createServer({ ...shallowDatabase });
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

  describe('createShallowDatabase: put', () => {
    let server: Express;
    beforeEach(() => {
      server = createServer({ ...shallowDatabase });
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

  describe('createShallowDatabase: patch', () => {
    let server: Express;
    beforeEach(() => {
      server = createServer({ ...shallowDatabase });
    });

    test('Should return correct data for valid key and successfully update database', async () => {
      const newJohnInfo = { age: 26, standName: 'The World' };

      const patchResponse = await request(server).patch('/john').send(newJohnInfo);
      expect(patchResponse.statusCode).toBe(200);
      expect(patchResponse.body).toStrictEqual({ ...shallowDatabase.john, ...newJohnInfo });

      const getResponse = await request(server).get('/john');
      expect(getResponse.body).toStrictEqual({ ...shallowDatabase.john, ...newJohnInfo });
    });

    test('Should return error when send non-object body', async () => {
      const response = await request(server)
        .patch('/john')
        .set('Content-Type', 'text/plain')
        .send('string');

      expect(response.statusCode).toBe(400);
      expect(response.body).toStrictEqual({
        message: 'Cannot handle PATCH for non-object data or body',
        data: shallowDatabase.john,
        body: 'string'
      });
    });
  });
});
