import request from 'supertest';

import { createMockServer } from 'mock-config-server';

import { mockServerConfig } from './path-string';

describe('Rest api / post requests / path string', () => {
  test('Should return default data', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server).post('/users');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('default');
  });

  test('Should return data by entities "includes" behavior', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server)
      .post('/users')
      .set({ header: 'header' })
      .query({ query: 'query' })
      .send({ body: 'body' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('entities');
  });

  test('Should return data by params "includes" behavior', async () => {
    const server = createMockServer(mockServerConfig);

    const response = await request(server).post('/users/param');

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('entities');
  });
});
