import express from 'express';
import request from 'supertest';

import { noCorsMiddleware } from './noCorsMiddleware';

describe('noCorsMiddleware', () => {
  test('Should set no cors settings for OPTIONS preflight request', async () => {
    const server = express();

    noCorsMiddleware(server);

    const response = await request(server).options('/');

    expect(response.headers).toMatchObject({
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true',
      'access-control-expose-headers': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-max-age': '3600'
    });
    expect(response.statusCode).toBe(204);
  });

  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;

  methods.forEach((method) => {
    test(`Should set no cors settings for ${method.toLocaleUpperCase()} request`, async () => {
      const server = express();

      noCorsMiddleware(server);

      const response = await request(server)[method]('/');

      expect(response.headers).toMatchObject({
        'access-control-allow-origin': '*',
        'access-control-allow-credentials': 'true',
        'access-control-expose-headers': '*'
      });

      const preflightHeaderNames = [
        'access-control-allow-headers',
        'access-control-allow-methods',
        'access-control-max-age'
      ];

      preflightHeaderNames.forEach((headerName) => {
        expect(response.headers).not.toHaveProperty(headerName);
      });
    });
  });
});
