import type { Buffer } from 'node:buffer';

import { describe, expect, it, vi } from 'vitest';

import { ws } from './ws';

const isPing = (raw: string | Buffer) => raw.toString() === 'ping';

describe('ws', () => {
  it('Should build config for ws.message handler', () => {
    const handler = vi.fn();
    const result = ws.message(handler);

    expect(result).toStrictEqual({
      type: 'raw',
      routes: [
        {
          data: handler
        }
      ]
    });
  });

  it('Should build config for ws.connection handler', () => {
    const handler = vi.fn();
    const result = ws.connection(handler);

    expect(result).toStrictEqual({
      type: 'connection',
      routes: [{ data: handler }]
    });
  });

  it('Should build config for ws.connection handler object with match', () => {
    const handler = vi.fn();
    const result = ws.connection({
      handler,
      match: {
        headers: {
          key: 'value'
        }
      }
    });

    expect(result).toStrictEqual({
      type: 'connection',
      routes: [
        {
          data: handler,
          entities: {
            headers: {
              key: 'value'
            }
          }
        }
      ]
    });
  });

  it('Should build config for ws.message handler object with match', () => {
    const handler = vi.fn();
    const result = ws.message({
      handler,
      match: {
        isBinary: false,
        raw: isPing
      }
    });

    expect(result).toStrictEqual({
      type: 'raw',
      routes: [
        {
          data: handler,
          entities: {
            isBinary: false,
            raw: isPing
          }
        }
      ]
    });
  });

  it('Should build config for ws.close handler', () => {
    const handler = vi.fn();
    const result = ws.close(handler);

    expect(result).toStrictEqual({
      type: 'close',
      routes: [{ data: handler }]
    });
  });

  it('Should build config for ws.close handler object with match', () => {
    const handler = vi.fn();
    const result = ws.close({
      handler,
      match: {
        code: 1000,
        reason: 'normal closure'
      }
    });

    expect(result).toStrictEqual({
      type: 'close',
      routes: [
        {
          data: handler,
          entities: {
            code: 1000,
            reason: 'normal closure'
          }
        }
      ]
    });
  });

  it('Should build config for ws.error handler', () => {
    const handler = vi.fn();
    const result = ws.error(handler);

    expect(result).toStrictEqual({
      type: 'error',
      routes: [{ data: handler }]
    });
  });

  it('Should build config for ws.error handler object with match', () => {
    const handler = vi.fn();
    const result = ws.error({ handler, match: { code: 'ECONNRESET', message: 'socket error' } });

    expect(result).toStrictEqual({
      type: 'error',
      routes: [
        {
          data: handler,
          entities: {
            code: 'ECONNRESET',
            message: 'socket error'
          }
        }
      ]
    });
  });

  it('Should not add entities when match is not provided', () => {
    const handler = vi.fn();

    expect(ws.message({ handler })).toStrictEqual({
      type: 'raw',
      routes: [{ data: handler, entities: undefined }]
    });
  });
});
