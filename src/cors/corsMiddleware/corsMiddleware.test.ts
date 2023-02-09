import express from 'express';
import request from 'supertest';

import type { Cors } from '../../utils/types';

import { corsMiddleware } from './corsMiddleware';

describe('corsMiddleware', () => {
  const testOrigin = 'https://test.com';
  const methods = ['get', 'post', 'put', 'patch', 'options'] as const;

  test('Should set default cors for request if does not set custom cors settings', () => {
    const server = express();

    const cors: Cors = {
      origin: testOrigin
    };

    corsMiddleware(server, cors);

    methods.forEach(async (method) => {
      const response = await request(server)[method]('/').set({ origin: testOrigin });

      expect(response.headers).toMatchObject({
        'access-control-allow-headers': '*',
        'access-control-allow-methods': '*',
        'access-control-allow-origin': 'https://test.com',
        'access-control-max-age': '3600',
        'access-control-allow-credentials': 'true'
      });
    });
  });

  test('Should not set cors for request if origin does not match', () => {
    const server = express();

    const cors: Cors = {
      origin: 'https://uncorrectDomain.com'
    };

    corsMiddleware(server, cors);

    const methods = ['get', 'options'] as const;

    methods.forEach(async (method) => {
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
        params: { headers: ['header1', 'header2'] },
        headers: {
          'access-control-allow-headers': 'header1, header2'
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

      methods.forEach(async (method) => {
        const response = await request(server)[method]('/').set({ origin: testOrigin });

        expect(response.headers).toMatchObject(headers);
      });
    });
  });
});
