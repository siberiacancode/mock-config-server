import type { Express } from 'express';
import express from 'express';
import request from 'supertest';

import type { ShallowDatabase } from '@/utils/types';

import { MemoryStorage } from '../../storages';

import { createShallowDatabaseRoutes } from './createShallowDatabaseRoutes';

describe('createShallowDatabaseRoutes', () => {
  const createShallowDatabase = () => ({
    users: [
      { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
      { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
    ],
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

  describe('createShallowDatabaseRoutes: filter function', () => {
    const shallowDatabase = createShallowDatabase();
    const server = createServer(shallowDatabase);

    test('Should return filtered array by query', async () => {
      const response = await request(server).get('/users?name=John Doe');

      expect(response.body).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });

    test('Should return filtered array by identical queries names', async () => {
      const response = await request(server).get('/users?age=25&age=30');

      expect(response.body).toStrictEqual(shallowDatabase.users);
    });

    test('Should return filtered array by nested query', async () => {
      const response = await request(server).get('/users?address.city=Novosibirsk');

      expect(response.body).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });

    test('Should return filtered array by neq operator', async () => {
      const response = await request(server).get('/users?age_neq=25');

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return filtered array by gt operator', async () => {
      const response = await request(server).get('/users?age_gt=25');

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return filtered array by gte operator', async () => {
      const response = await request(server).get('/users?age_gte=25');

      expect(response.body).toStrictEqual(shallowDatabase.users);
    });

    test('Should return filtered array by lt operator', async () => {
      const response = await request(server).get('/users?age_lt=30');

      expect(response.body).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });

    test('Should return filtered array by lte operator', async () => {
      const response = await request(server).get('/users?age_lte=30');

      expect(response.body).toStrictEqual(shallowDatabase.users);
    });

    test('Should return filtered array by cn operator', async () => {
      const response = await request(server).get('/users?name_cn=Jane');

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return filtered array by ncn operator', async () => {
      const response = await request(server).get('/users?name_ncn=Jane');

      expect(response.body).toStrictEqual([
        {
          name: 'John Doe',
          age: 25,
          address: { city: 'Novosibirsk' }
        }
      ]);
    });

    test('Should return filtered array by sw operator', async () => {
      const response = await request(server).get('/users?name_sw=J');

      expect(response.body).toStrictEqual(shallowDatabase.users);
    });

    test('Should return filtered array by nsw operator', async () => {
      const response = await request(server).get('/users?name_nsw=J');

      expect(response.body).toStrictEqual([]);
    });

    test('Should return filtered array by ew operator', async () => {
      const response = await request(server).get('/users?name_ew=a');

      expect(response.body).toStrictEqual([]);
    });

    test('Should return filtered array by new operator', async () => {
      const response = await request(server).get('/users?name_new=a=J');

      expect(response.body).toStrictEqual(shallowDatabase.users);
    });
  });

  describe('createShallowDatabaseRoutes: pagination function', () => {
    const shallowDatabase = createShallowDatabase();
    const server = createServer(shallowDatabase);

    test('Should return paginationed data by query', async () => {
      const response = await request(server).get('/users?_page=1');

      expect(response.body.results).toStrictEqual([
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
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
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
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

      const firstResponseLinks = firstResponse.headers.link.match(linkHeaderRegexp);
      expect(firstResponse.headers.link).toMatch(linkHeaderRegexp);

      if (!firstResponseLinks) throw new Error('Link header not found');

      expect(firstResponseLinks.length).toEqual(3);

      const [firstNextLink, firstPrevLink, firstLastLink] = firstResponseLinks;
      expect(firstNextLink).toContain('/users?_page=1&_limit=1>; rel="first"');
      expect(firstPrevLink).toContain('/users?_page=2&_limit=1>; rel="next"');
      expect(firstLastLink).toContain('/users?_page=2&_limit=1>; rel="last"');

      expect(firstResponse.body.results).toStrictEqual([
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
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

      if (!secondResponseLinks) throw new Error('Link header not found');

      expect(secondResponseLinks.length).toEqual(3);

      const [secondNextLink, secondPrevLink, secondLastLink] = secondResponseLinks;
      expect(secondNextLink).toContain('/users?_page=1&_limit=1>; rel="first"');
      expect(secondPrevLink).toContain('/users?_page=2&_limit=1>; rel="next"');
      expect(secondLastLink).toContain('/users?_page=2&_limit=1>; rel="last"');

      expect(secondResponse.body.results).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
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
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });
  });

  describe('createShallowDatabaseRoutes: slice function', () => {
    const shallowDatabase = createShallowDatabase();
    const server = createServer(shallowDatabase);

    test('Should return sliced array by _begin query', async () => {
      const response = await request(server).get('/users?_begin=1');

      expect(response.body).toStrictEqual(shallowDatabase.users.slice(1));
    });

    test('Should return sliced array by _end query', async () => {
      const response = await request(server).get('/users?_end=1');

      expect(response.body).toStrictEqual(shallowDatabase.users.slice(0, 1));
    });

    test('Should return sliced array by _begin and _end query', async () => {
      const response = await request(server).get('/users?_begin=0&_end=2');

      expect(response.body).toStrictEqual(shallowDatabase.users.slice(0, 2));
    });
  });

  describe('createShallowDatabaseRoutes: sort function', () => {
    const shallowDatabase = createShallowDatabase();
    const server = createServer({
      users: [
        ...shallowDatabase.users,
        { name: 'Will Smith', age: 27, address: { city: 'Moscow' } }
      ]
    });

    test('Should return sorted data by query', async () => {
      const response = await request(server).get('/users?_sort=age');

      expect(response.body).toStrictEqual([
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } }
      ]);
    });

    test('Should return sorted data by query with order', async () => {
      const response = await request(server).get('/users?_sort=age&_order=desc');

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return sorted data by multiple query', async () => {
      const response = await request(server).get(
        '/users?_sort=name&_order=asc&_sort=age&_order=desc'
      );

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { name: 'Will Smith', age: 27, address: { city: 'Moscow' } },
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } }
      ]);
    });

    test('Should return filtered array by nested query', async () => {
      const response = await request(server).get('/users?_sort=address.city&_order=desc');

      expect(response.body).toStrictEqual([
        { name: 'Jane Smith', age: 30, address: { city: 'Tomsk' } },
        { name: 'John Doe', age: 25, address: { city: 'Novosibirsk' } },
        { name: 'Will Smith', age: 27, address: { city: 'Moscow' } }
      ]);
    });
  });
});
