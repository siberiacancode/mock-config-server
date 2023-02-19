import express from 'express';
import request from 'supertest';

import type { Cors } from '../../utils/types';

import { corsMiddleware } from './corsMiddleware';

describe('corsMiddleware', () => {
  const testOrigin = 'https://test.com';

  test('Should set default cors for OPTIONS preflight request if does not set custom cors settings', async () => {
    const server = express();
    const cors: Cors = {
      origin: testOrigin
    };

    corsMiddleware(server, cors);

    const response = await request(server).options('/').set({ origin: testOrigin });

    expect(response.headers).toMatchObject({
      'access-control-allow-headers': '*',
      'access-control-expose-headers': '*',
      'access-control-allow-methods': '*',
      'access-control-allow-origin': 'https://test.com',
      'access-control-max-age': '3600',
      'access-control-allow-credentials': 'true'
    });
  });

  const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;

  methods.forEach((method) => {
    test(`Should set default cors for ${method.toLocaleUpperCase()} request if does not set custom cors settings`, async () => {
      const server = express();
      const cors: Cors = {
        origin: testOrigin
      };

      corsMiddleware(server, cors);

      const response = await request(server)[method]('/').set({ origin: testOrigin });

      expect(response.headers).toMatchObject({
        'access-control-allow-origin': 'https://test.com',
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

  methods.forEach((method) => {
    test(`Should set default cors for ${method.toLocaleUpperCase()} request if does not set custom cors settings`, async () => {
      const server = express();
      const cors: Cors = {
        origin: testOrigin
      };

      corsMiddleware(server, cors);

      const response = await request(server)[method]('/').set({ origin: testOrigin });

      expect(response.headers).toMatchObject({
        'access-control-allow-origin': 'https://test.com',
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

  methods.forEach((method) => {
    test(`Should not set cors for ${method.toLocaleUpperCase()} request if origin does not match`, async () => {
      const server = express();
      const cors: Cors = {
        origin: 'https://uncorrectDomain.com'
      };

      corsMiddleware(server, cors);

      const response = await request(server)[method]('/').set({ origin: testOrigin });
      const headerNames = [
        'access-control-allow-headers',
        'access-control-allow-methods',
        'access-control-allow-origin',
        'access-control-max-age',
        'access-control-allow-credentials'
      ];

      headerNames.forEach((headerName) => {
        expect(response.headers).not.toHaveProperty(headerName);
      });
    });
  });

  const corsParamsAndHeaders: { params: Omit<Cors, 'origin'>; headers: Record<string, string> }[] =
    [
      {
        params: { allowedHeaders: ['header1', 'header2'] },
        headers: {
          'access-control-allow-headers': 'header1, header2'
        }
      },
      {
        params: { exposedHeaders: ['header1', 'header2'] },
        headers: {
          'access-control-expose-headers': 'header1, header2'
        }
      },
      {
        params: { maxAge: 10000 },
        headers: {
          'access-control-max-age': '10000'
        }
      },
      {
        params: { methods: ['GET', 'POST'] },
        headers: {
          'access-control-allow-methods': 'GET, POST'
        }
      },
      {
        params: { credentials: false },
        headers: {
          'access-control-allow-credentials': 'false'
        }
      }
    ];

  corsParamsAndHeaders.forEach(({ params, headers }) => {
    test(`Should set allow param(s) ${Object.keys(params).join(', ')} to header(s) ${Object.keys(
      headers
    ).join(', ')}`, async () => {
      const server = express();
      const cors: Cors = {
        origin: testOrigin,
        ...params
      };

      corsMiddleware(server, cors);

      const response = await request(server).options('/').set({ origin: testOrigin });

      expect(response.headers).toMatchObject(headers);
    });
  });
});
