import type { Response as ExpressResponse } from 'express';

import { describe, expectTypeOf, it } from 'vitest';

import { rest } from './rest';

describe('rest types', () => {
  it('Should infer request-only handler and polling types', () => {
    rest.get<{ query: { test: 1 } }>('/users', (params) => {
      expectTypeOf(params.request.query).toEqualTypeOf<{ test: 1 }>();
      return params.request.query.test;
    });

    rest.post<{ body: { name: string } }>('/users', async ({ request }) => {
      expectTypeOf(request.body).toEqualTypeOf<{ name: string }>();
      return { name: request.body.name };
    });

    rest.get<{ params: { id: string } }>('/users/:id', function* ({ request }) {
      expectTypeOf(request.params).toEqualTypeOf<{ id: string }>();
      yield request.params.id;
    });

    rest.get<{ query: { test: 1 } }>(
      '/poll',
      rest.polling([
        {
          handler: (params) => {
            expectTypeOf(params.request.query).toEqualTypeOf<{ test: 1 }>();
            return params.request.query.test;
          }
        }
      ])
    );
  });

  it('Should accept default and request-only inline responses', () => {
    rest.get('/users', { ok: true });
    rest.get<{ query: { test: 1 } }>('/users', { ok: true });
    rest.get('/users', ({ request }) => {
      expectTypeOf(request).not.toBeAny();
      return { ok: true };
    });
  });

  it('Should preserve explicit response constraints', () => {
    rest.get<{ response: { a: 1; b: 2 } }>('/users', { a: 1, b: 2 });
    rest.get<{ response: { a: 1; b: 2 } }>('/users', () => ({ a: 1, b: 2 }));

    // @ts-expect-error Inline responses must include all required properties.
    rest.get<{ response: { a: 1; b: 2 } }>('/users', { a: 1 });
    // @ts-expect-error Handler responses must include all required properties.
    rest.get<{ response: { a: 1; b: 2 } }>('/users', () => ({ a: 1 }));
  });

  it('Should type handler params with all typed fields', () => {
    rest.post<{
      query: { query: string };
      body: { body: string };
      params: { params: string };
      response: { response: string };
    }>('/users/:id', ({ request }) => {
      expectTypeOf(request.query).toEqualTypeOf<{ query: string }>();
      expectTypeOf(request.body).toEqualTypeOf<{ body: string }>();
      expectTypeOf(request.params).toEqualTypeOf<{ params: string }>();
      expectTypeOf(request.res).toEqualTypeOf<ExpressResponse<{ response: string }> | undefined>();

      return { response: 'value' };
    });
  });

  it('Should type inline responses and handlers with reserved config fields', () => {
    interface FileResponse {
      file: '/tmp/user.json';
    }
    interface PollingResponse {
      polling: [{ response: 'ordinary response data' }];
    }

    rest.get<{ response: FileResponse }>('/users/file', { file: '/tmp/user.json' });
    rest.get<{ response: PollingResponse }>('/users/polling', {
      polling: [{ response: 'ordinary response data' }]
    });

    rest.get<{ response: FileResponse }>('/users/file-handler', () => ({
      file: '/tmp/user.json'
    }));
    rest.get<{ response: PollingResponse }>('/users/polling-handler', () => ({
      polling: [{ response: 'ordinary response data' }]
    }));
  });
});
