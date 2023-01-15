import express from 'express';
import request from 'supertest';

import type { Cors } from '../../utils/types';

import { corsMiddleware } from './corsMiddleware';

describe('corsMiddleware', () => {
  test('Should set default cors for request if does not set custom cors settings', async () => {
    const server = express();

    const cors: Cors = {
      origin: ['https://test.com', 'https://uncorrectDomain.com']
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-origin': 'https://test.com',
      'access-control-max-age': '3600',
      'access-control-allow-credentials': 'true'
    });
  });

  test('Should not set cors for request if origin does not match', async () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://uncorrectDomain.com'
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).not.toHaveProperty('access-control-allow-headers');
    expect(response.headers).not.toHaveProperty('access-control-allow-methods');
    expect(response.headers).not.toHaveProperty('access-control-allow-origin');
    expect(response.headers).not.toHaveProperty('access-control-max-age');
    expect(response.headers).not.toHaveProperty('access-control-allow-credentials');
  });

  test('Should set allow headers to access-control-allow-headers', async () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://test.com',
      headers: ['header1', 'header2']
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).toMatchObject({
      'access-control-allow-headers': 'header1, header2'
    });
  });

  test('Should set methods to access-control-allow-methods', async () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://test.com',
      methods: ['GET', 'POST']
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).toMatchObject({
      'access-control-allow-methods': 'GET, POST'
    });
  });

  test('Should set methods to access-control-allow-credentials', async () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://test.com',
      credentials: false
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).toMatchObject({
      'access-control-allow-credentials': 'false'
    });
  });

  test('Should set max-age to access-control-max-age', async () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://test.com',
      maxAge: 10000
    };

    corsMiddleware(server, cors);
    const response = await request(server).get('/').set({ origin: 'https://test.com' });

    expect(response.headers).toMatchObject({
      'access-control-max-age': '10000'
    });
  });
});
