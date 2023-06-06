import express from 'express';
import request from 'supertest';

import { errorMiddleware } from './errorMiddleware';

describe('errorMiddleware', () => {
  test('Should handle error from server handler', async () => {
    const server = express();

    server.get('/error', () => {
      throw new Error('error');
    });

    server.get('/success', (_request, response) => {
      response.send('success');
    });

    errorMiddleware(server);

    const errorResponse = await request(server).get('/error');
    const successResponse = await request(server).get('/success');

    expect(errorResponse.status).toEqual(500);
    expect(successResponse.status).toEqual(200);
  });
});
