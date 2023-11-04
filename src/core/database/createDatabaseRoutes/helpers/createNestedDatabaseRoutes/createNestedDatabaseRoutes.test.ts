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

  describe('createNestedDatabaseRoutes: sort function', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return sorted data by query', async () => {
      const response = await request(server).get('/users?_sort=age');

      expect(response.body).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return sorted data by query with order', async () => {
      const response = await request(server).get('/users?_sort=age&_order=desc');

      expect(response.body).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return sorted data by multiple query', async () => {
      const response = await request(server).get(
        '/users?_sort=name&_order=acs&_sort=id&_order=desc'
      );

      expect(response.body).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return filtered array by nested query', async () => {
      const response = await request(server).get('/users?_sort=address.city&_order=desc');

      expect(response.body).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });
  });
});
