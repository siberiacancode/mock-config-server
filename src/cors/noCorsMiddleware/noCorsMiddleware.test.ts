import express from 'express';
import request from 'supertest';

import { noCorsMiddleware } from './noCorsMiddleware';

describe('noCorsMiddleware', () => {
  test('Should set no cors settings for request', async () => {
    const server = express();

    noCorsMiddleware(server);
    const response = await request(server).get('/');

    expect(response.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-origin': '*',
      'access-control-max-age': '3600',
      'access-control-allow-credentials': 'true'
    });
  });
});
