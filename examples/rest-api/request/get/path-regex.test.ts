import request from 'supertest';

import { createMockServer } from 'mock-config-server';

import { mockServerConfig } from './path-regex';

describe('Rest api / get requests / path regex', () => {
  test('Should return default data', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server).get('/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('default');
  });

  test('Should return data by entities "includes" behavior', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server)
      .get('/users')
      .set({ header: 'header' })
      .query({ query: 'query' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('entities');
  });

  test('Should return data by params "includes" behavior', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server).get('/users/param');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('entities');
  });
});
