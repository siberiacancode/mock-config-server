import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import { createWsFrame } from './createWsFrame';

describe('createWsFrame', () => {
  it('Should decode a text frame into a string', () => {
    expect(createWsFrame(Buffer.from('ping'), false)).toStrictEqual({
      isBinary: false,
      raw: 'ping'
    });
  });

  it('Should keep a binary frame as a buffer', () => {
    const payload = Buffer.from([0x00, 0x01, 0xfe]);

    expect(createWsFrame(payload, true)).toStrictEqual({ isBinary: true, raw: payload });
  });

  it('Should not parse a json text frame', () => {
    expect(createWsFrame(Buffer.from('{"type":"ping"}'), false).raw).toBe('{"type":"ping"}');
  });

  it('Should not decode a binary frame that is not valid utf-8', () => {
    const payload = Buffer.from([0xff, 0xfe, 0xfd]);

    expect(createWsFrame(payload, true).raw).toBe(payload);
  });
});
