import type { Request, Response } from 'express';

import { describe, expect, it, vi } from 'vitest';

import type { HttpResponseInterceptorHandlerParams, PlainObject } from '@/utils/types';

import { graphql, http, rest } from '@/core/interceptors';

import { callHttpResponseInterceptors } from './callHttpResponseInterceptors';

const createRequest = (value: PlainObject = {}) =>
  ({
    headers: {},
    cookies: {},
    context: { orm: {} },
    ...value
  }) as Request;

const meta = { type: 'rest', method: 'get' } as const;

describe('callHttpResponseInterceptors: order of calls', () => {
  it('Should call all passed response interceptors in order: component -> server', async () => {
    const componentInterceptor = vi.fn((data) => `${data}componentInterceptor;`);
    const serverInterceptor = vi.fn((data) => `${data}serverInterceptor`);
    const request = createRequest();
    const response = {} as Response;

    expect(
      await callHttpResponseInterceptors(
        {
          data: '',
          meta,
          request,
          response
        },
        {}
      )
    ).toBe('');
    expect(componentInterceptor).toBeCalledTimes(0);
    expect(serverInterceptor).toBeCalledTimes(0);

    expect(
      await callHttpResponseInterceptors(
        {
          data: '',
          meta,
          request,
          response
        },
        {
          componentInterceptors: [rest.response.get(componentInterceptor)],
          serverInterceptors: [rest.response.get(serverInterceptor)]
        }
      )
    ).toBe('componentInterceptor;serverInterceptor');
    expect(componentInterceptor).toBeCalledTimes(1);
    expect(serverInterceptor).toBeCalledTimes(1);
    expect(componentInterceptor.mock.invocationCallOrder[0]).toBeLessThan(
      serverInterceptor.mock.invocationCallOrder[0]
    );
  });
});

describe('callHttpResponseInterceptors: interceptors filtering', () => {
  it('Should call only interceptors matched by rest method', async () => {
    const allInterceptor = vi.fn((data) => data);
    const getInterceptor = vi.fn((data) => data);
    const postInterceptor = vi.fn((data) => data);

    await callHttpResponseInterceptors(
      {
        data: { key: 'value' },
        meta,
        request: createRequest(),
        response: {} as Response
      },
      {
        componentInterceptors: [
          http.response.all(allInterceptor),
          rest.response.get(getInterceptor),
          rest.response.post(postInterceptor)
        ]
      }
    );

    expect(allInterceptor).toBeCalledTimes(1);
    expect(getInterceptor).toBeCalledTimes(1);
    expect(postInterceptor).toBeCalledTimes(0);
  });

  it('Should call only interceptors matched by graphql operation type', async () => {
    const queryInterceptor = vi.fn((data) => data);
    const mutationInterceptor = vi.fn((data) => data);

    await callHttpResponseInterceptors(
      {
        data: { key: 'value' },
        meta: { type: 'graphql', operationType: 'query' },
        request: createRequest(),
        response: {} as Response
      },
      {
        componentInterceptors: [
          graphql.response.query(queryInterceptor),
          graphql.response.mutation(mutationInterceptor)
        ]
      }
    );

    expect(queryInterceptor).toBeCalledTimes(1);
    expect(mutationInterceptor).toBeCalledTimes(0);
  });
});

describe('callHttpResponseInterceptors: params functions', () => {
  it('Should correctly get header from request.headers object when use getRequestHeader param', async () => {
    const request = createRequest({ headers: { name: 'value' } });
    const interceptor = vi.fn((data, { getRequestHeader }) => {
      expect(getRequestHeader('name')).toBe('value');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request, response: {} as Response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(interceptor).toBeCalledTimes(1);
  });

  it('Should correctly get headers as request.headers object when use getRequestHeaders param', async () => {
    const request = createRequest({ headers: { name: 'value' } });
    const interceptor = vi.fn((data, { getRequestHeaders }) => {
      expect(getRequestHeaders()).toStrictEqual({ name: 'value' });
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request, response: {} as Response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(interceptor).toBeCalledTimes(1);
  });

  it('Should correctly call response getHeader method when use getResponseHeader param', async () => {
    const response = { getHeader: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { getResponseHeader }) => {
      getResponseHeader('header');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.getHeader).toHaveBeenCalledWith('header');
    expect(response.getHeader).toBeCalledTimes(1);
  });

  it('Should correctly call response getHeaders method when use getResponseHeaders param', async () => {
    const response = { getHeaders: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { getResponseHeaders }) => {
      getResponseHeaders();
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.getHeaders).toHaveBeenCalledWith();
    expect(response.getHeaders).toBeCalledTimes(1);
  });

  it('Should correctly call response set method when use setHeader param', async () => {
    const response = { set: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { setHeader }) => {
      setHeader('name', 'value');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.set).toHaveBeenCalledWith('name', 'value');
    expect(response.set).toBeCalledTimes(1);
  });

  it('Should correctly call response append method when use appendHeader param', async () => {
    const response = { append: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { appendHeader }) => {
      appendHeader('name', 'value');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.append).toHaveBeenCalledWith('name', 'value');
    expect(response.append).toBeCalledTimes(1);
  });

  it('Should correctly set statusCode into response when use setStatusCode param', async () => {
    const response = {} as Response;
    const interceptor = vi.fn((data, { setStatusCode }) => {
      setStatusCode(204);
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.statusCode).toBe(204);
    expect(interceptor).toBeCalledTimes(1);
  });

  it('Should correctly get cookie from request.cookies object when use getCookie param', async () => {
    const request = createRequest({ cookies: { name: 'value' } });
    const interceptor = vi.fn((data, { getCookie }) => {
      expect(getCookie('name')).toBe('value');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request, response: {} as Response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(interceptor).toBeCalledTimes(1);
  });

  it('Should correctly call response cookie method when use setCookie param without options', async () => {
    const response = { cookie: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { setCookie }) => {
      setCookie('name', 'value');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.cookie).toHaveBeenCalledWith('name', 'value');
    expect(response.cookie).toBeCalledTimes(1);
  });

  it('Should correctly call response cookie method when use setCookie param with options', async () => {
    const response = { cookie: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { setCookie }) => {
      setCookie('name', 'value', { path: '/your/path' });
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.cookie).toHaveBeenCalledWith('name', 'value', { path: '/your/path' });
    expect(response.cookie).toBeCalledTimes(1);
  });

  it('Should correctly call response clearCookie method when use clearCookie param', async () => {
    const response = { clearCookie: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { clearCookie }) => {
      clearCookie('name', { path: '/your/path' });
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.clearCookie).toHaveBeenCalledWith('name', { path: '/your/path' });
    expect(response.clearCookie).toBeCalledTimes(1);
  });

  it('Should correctly provide params', async () => {
    const request = createRequest();
    const response = {} as Response;
    let params: HttpResponseInterceptorHandlerParams;
    const interceptor = vi.fn((data, interceptorParams) => {
      params = interceptorParams;
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request, response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(params!.request).toBe(request);
    expect(params!.response).toBe(response);
    await expect(params!.setDelay(0)).resolves.toBeUndefined();
  });

  it('Should correctly call response attachment method when use attachment param', async () => {
    const response = { attachment: vi.fn() } as unknown as Response;
    const interceptor = vi.fn((data, { attachment }) => {
      attachment('filename');
      return data;
    });

    await callHttpResponseInterceptors(
      { data: null, meta, request: createRequest(), response },
      { componentInterceptors: [rest.response.get(interceptor)] }
    );

    expect(response.attachment).toHaveBeenCalledWith('filename');
    expect(response.attachment).toBeCalledTimes(1);
  });
});
