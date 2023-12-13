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

      expect(response.body.results).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
      expect(response.body._link).toEqual(
        expect.objectContaining({
          count: 2,
          pages: 1,
          current: 1,
          next: null,
          prev: null
        })
      );
      expect(response.body._link.first).toContain('/users?_page=1');
      expect(response.body._link.last).toContain('/users?_page=1');
    });

    test('Should return paginationed data by query with limit', async () => {
      const response = await request(server).get('/users?_page=1&_limit=1');

      expect(response.body.results).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
      expect(response.body._link).toEqual(
        expect.objectContaining({
          count: 2,
          pages: 2,
          current: 1,
          prev: null
        })
      );
      expect(response.body._link.first).toContain('/users?_page=1&_limit=1');
      expect(response.body._link.last).toContain('/users?_page=2&_limit=1');
      expect(response.body._link.next).toContain('/users?_page=2&_limit=1');
    });

    test('Should return valid _link for paginationed data', async () => {
      const linkHeaderRegexp = /<([^>]+)>;\s*rel="([^"]+)"/g;
      const firstResponse = await request(server).get('/users?_page=1&_limit=1');

      const firstResponseLinks: string[] = firstResponse.headers.link.match(linkHeaderRegexp);
      expect(firstResponse.headers.link).toMatch(linkHeaderRegexp);
      expect(firstResponseLinks.length).toEqual(3);

      const [firstNextLink, firstPrevLink, firstLastLink] = firstResponseLinks;
      expect(firstNextLink).toContain('/users?_page=1&_limit=1>; rel="first"');
      expect(firstPrevLink).toContain('/users?_page=2&_limit=1>; rel="next"');
      expect(firstLastLink).toContain('/users?_page=2&_limit=1>; rel="last"');

      expect(firstResponse.body.results).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
      expect(firstResponse.body._link).toEqual(
        expect.objectContaining({
          count: 2,
          pages: 2,
          current: 1,
          prev: null
        })
      );
      expect(firstResponse.body._link.first).toContain('/users?_page=1&_limit=1');
      expect(firstResponse.body._link.last).toContain('/users?_page=2&_limit=1');
      expect(firstResponse.body._link.next).toContain('/users?_page=2&_limit=1');

      const secondResponse = await request(server).get('/users?_page=2&_limit=1');

      const secondResponseLinks = firstResponse.headers.link.match(linkHeaderRegexp);
      expect(secondResponse.headers.link).toMatch(linkHeaderRegexp);
      expect(secondResponseLinks.length).toEqual(3);

      const [secondNextLink, secondPrevLink, secondLastLink] = secondResponseLinks;
      expect(secondNextLink).toContain('/users?_page=1&_limit=1>; rel="first"');
      expect(secondPrevLink).toContain('/users?_page=2&_limit=1>; rel="next"');
      expect(secondLastLink).toContain('/users?_page=2&_limit=1>; rel="last"');

      expect(secondResponse.body.results).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
      expect(secondResponse.body._link).toEqual(
        expect.objectContaining({
          count: 2,
          pages: 2,
          current: 2,
          next: null
        })
      );
      expect(secondResponse.body._link.first).toContain('/users?_page=1&_limit=1');
      expect(secondResponse.body._link.last).toContain('/users?_page=2&_limit=1');
      expect(secondResponse.body._link.prev).toContain('/users?_page=1&_limit=1');
    });

    test('Should return valid data by invalid pagination data', async () => {
      const response = await request(server).get('/users?_page=2');

      expect(response.body).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });
  });

  describe('createNestedDatabaseRoutes: slice function', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer(nestedDatabase);

    test('Should return sliced array by _begin query', async () => {
      const response = await request(server).get('/users?_begin=1');

      expect(response.body).toStrictEqual(nestedDatabase.users.slice(1));
    });

    test('Should return sliced array by _end query', async () => {
      const response = await request(server).get('/users?_end=1');

      expect(response.body).toStrictEqual(nestedDatabase.users.slice(0, 1));
    });

    test('Should return sliced array by _begin and _end query', async () => {
      const response = await request(server).get('/users?_begin=0&_end=2');

      expect(response.body).toStrictEqual(nestedDatabase.users.slice(0, 2));
    });
  });

  describe('createNestedDatabaseRoutes: sort function', () => {
    const nestedDatabase = createNestedDatabase();
    const server = createServer({
      users: [
        ...nestedDatabase.users,
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' } }
      ]
    });

    test('Should return sorted data by query', async () => {
      const response = await request(server).get('/users?_sort=age');

      expect(response.body).toStrictEqual([
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return sorted data by query with order', async () => {
      const response = await request(server).get('/users?_sort=age&_order=desc');

      expect(response.body).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return sorted data by multiple query', async () => {
      const response = await request(server).get(
        '/users?_sort=name&_order=asc&_sort=id&_order=desc'
      );

      expect(response.body).toStrictEqual([
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return filtered array by nested query', async () => {
      const response = await request(server).get('/users?_sort=address.city&_order=desc');

      expect(response.body).toStrictEqual([
        { id: 2, name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { id: 1, name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { id: 3, name: 'Will Smith', age: 27, address: { city: 'Moscow' } }
      ]);
    });
  });
});
