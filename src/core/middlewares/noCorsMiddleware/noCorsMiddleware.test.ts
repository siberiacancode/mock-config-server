import express from 'express';
import request from 'supertest';

import { noCorsMiddleware } from './noCorsMiddleware';

describe('noCorsMiddleware', () => {
  test('Should set no cors settings for OPTIONS preflight request', async () => {
    const server = express();

    noCorsMiddleware(server);

    const preflightHeaders = {
      'access-control-request-method': '*',
      'access-control-request-headers': '*',
      origin: '/'
    };
    const response = await request(server).options('/').set(preflightHeaders);

    expect(response.headers).toMatchObject({
      'access-control-allow-origin': '/',
      'access-control-allow-credentials': 'true',
      'access-control-expose-headers':
        'host, accept-encoding, access-control-request-method, access-control-request-headers, origin, connection',
      'access-control-allow-headers':
        'host, accept-encoding, access-control-request-method, access-control-request-headers, origin, connection',
      'access-control-allow-methods': '*',
      'access-control-max-age': '3600'
    });
    expect(response.statusCode).toBe(204);
  });

  test(`Should set no cors settings for request`, async () => {
    const server = express();

    noCorsMiddleware(server);

    const response = await request(server).get('/').set('origin', '/');

    expect(response.headers).toMatchObject({
      'access-control-allow-origin': '/',
      'access-control-allow-credentials': 'true',
      'access-control-expose-headers': 'host, accept-encoding, origin, connection'
    });

    expect(response.headers).not.toMatchObject({
      'access-control-allow-headers': expect.any(String),
      'access-control-allow-methods': expect.any(String),
      'access-control-max-age': expect.any(String)
    });
  });

  test(`Should set correct no cors settings for request with credentials`, async () => {
    const server = express();

    noCorsMiddleware(server);

    const preflightHeaders = {
      'access-control-request-method': '*',
      'access-control-request-headers': '*',
      origin: '/'
    };

    const response = await request(server)
      .options('/')
      .set(preflightHeaders)
      .set('cookie', 'key=value;');

    expect(response.headers).toMatchObject({
      'access-control-allow-origin': '/',
      'access-control-allow-headers':
        'host, accept-encoding, access-control-request-method, access-control-request-headers, origin, cookie, connection',
      'access-control-expose-headers':
        'host, accept-encoding, access-control-request-method, access-control-request-headers, origin, cookie, connection',
      'access-control-allow-credentials': 'true'
    });
  });
});
