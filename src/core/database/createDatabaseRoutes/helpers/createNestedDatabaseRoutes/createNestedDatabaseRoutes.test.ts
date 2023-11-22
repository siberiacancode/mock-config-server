import type { Express } from 'express';
import express from 'express';
import request from 'supertest';

import type { NestedDatabase } from '@/utils/types';

import { MemoryStorage } from '../../storages';

import { createNestedDatabaseRoutes } from './createNestedDatabaseRoutes';

describe('CreateNestedDatabaseRoutes', () => {
  const createNestedDatabase = () => ({
    users: [
      { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
      { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
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

  describe('createNestedDatabaseRoutes: GET method for collection', () => {
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

  describe('createNestedDatabaseRoutes: POST method for collection', () => {
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

  describe('createNestedDatabaseRoutes: GET method for item', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return correct data for valid key and id', async () => {
      const response = await request(server).get('/users/1');

      expect(response.body).toStrictEqual(nestedDatabase.users.find((item) => item.id === 1));
    });

    test('Should correct Cache-Control header for valid key and id', async () => {
      const response = await request(server).get('/users/1');

      expect(response.headers['cache-control']).toBe('max-age=0, must-revalidate');
    });

    test('Should return 404 for non-existent id', async () => {
      const response = await request(server).get('/users/3');

      expect(response.status).toBe(404);
    });
  });

  describe('createNestedDatabaseRoutes: PUT method for item', () => {
    let nestedDatabase: ReturnType<typeof createNestedDatabase>;
    let server: Express;
    beforeEach(() => {
      nestedDatabase = createNestedDatabase();
      server = createServer(nestedDatabase);
    });

    test('Should correctly replace resource (ignoring id) for valid key and id', async () => {
      const response = await request(server).put('/users/1').send({ id: 3, name: 'John Smith' });

      expect(response.body).toStrictEqual({ id: 1, name: 'John Smith' });
    });

    test('Should return 404 for non-existent id', async () => {
      const response = await request(server).put('/users/3');

      expect(response.status).toBe(404);
    });
  });

  describe('createNestedDatabaseRoutes: PATCH method for item', () => {
    let nestedDatabase: ReturnType<typeof createNestedDatabase>;
    let server: Express;
    beforeEach(() => {
      nestedDatabase = createNestedDatabase();
      server = createServer(nestedDatabase);
    });

    test('Should correctly update resource (ignoring id) for valid key and id', async () => {
      const response = await request(server).patch('/users/1').send({ id: 3, name: 'John Smith' });

      expect(response.body).toStrictEqual({
        id: 1,
        name: 'John Smith',
        age: 25,
        address: { city: 'Novosibirsk' }
      });
    });

    test('Should return 404 for non-existent id', async () => {
      const response = await request(server).patch('/users/3');

      expect(response.status).toBe(404);
    });
  });

  describe('createNestedDatabase: DELETE method for item', () => {
    let nestedDatabase: ReturnType<typeof createNestedDatabase>;
    let server: Express;
    beforeEach(() => {
      nestedDatabase = createNestedDatabase();
      server = createServer(nestedDatabase);
    });

    test('Should correctly delete item from collection for valid key and id', async () => {
      const deleteResponse = await request(server).delete('/users/1');
      expect(deleteResponse.status).toBe(204);

      const getResponse = await request(server).get('/users/1');
      expect(getResponse.status).toBe(404);
    });

    test('Should return 404 for non-existent id', async () => {
      const response = await request(server).delete('/users/3');

      expect(response.status).toBe(404);
    });
  });

  describe('createNestedDatabaseRoutes: filter function', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return filtered array by query', async () => {
      const response = await request(server).get('/users?name=John Doe');

      expect(response.body).toStrictEqual([
        {
          id: 1,
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });

    test('Should return filtered array by identical queries names', async () => {
      const response = await request(server).get('/users?id=1&id=2');

      expect(response.body).toStrictEqual(nestedDatabase.users);
    });

    test('Should return filtered array by nested query', async () => {
      const response = await request(server).get('/users?address.city=Novosibirsk');

      expect(response.body).toStrictEqual([
        {
          id: 1,
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });
  });

  describe('createNestedDatabaseRoutes: pagination function', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return paginationed data by query', async () => {
      const response = await request(server).get('/users?_page=1');

      expect(response.body).toStrictEqual({
        _link: {
          count: 2,
          pages: 1,
          next: null,
          prev: null
        },
        results: [
          { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
          { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
        ]
      });
    });

    test('Should return paginationed data by query with limit', async () => {
      const response = await request(server).get('/users?_page=1&_limit=1');

      expect(response.body).toStrictEqual({
        _link: {
          count: 2,
          pages: 2,
          next: '?_page=2&_limit=1',
          prev: null
        },
        results: [{ id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }]
      });
    });

    test('Should return correct _link for paginationed data', async () => {
      const firstResponse = await request(server).get('/users?_page=1&_limit=1');
      const firstLink = {
        count: 2,
        pages: 2,
        next: '?_page=2&_limit=1',
        prev: null
      };

      expect(firstResponse.headers['mcs-link']).toStrictEqual(JSON.stringify(firstLink));
      expect(firstResponse.body).toStrictEqual({
        _link: firstLink,
        results: [{ id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }]
      });

      const secondResponse = await request(server).get(`/users${firstResponse.body._link.next}`);
      const secondLink = {
        count: 2,
        pages: 2,
        next: null,
        prev: '?_page=1&_limit=1'
      };

      expect(secondResponse.headers['mcs-link']).toStrictEqual(JSON.stringify(secondLink));
      expect(secondResponse.body).toStrictEqual({
        _link: secondLink,
        results: [{ id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }]
      });
    });

    test('Should return normal data by invalid pagination data', async () => {
      const response = await request(server).get('/users?_page=2');

      expect(response.body).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });
  });
});
