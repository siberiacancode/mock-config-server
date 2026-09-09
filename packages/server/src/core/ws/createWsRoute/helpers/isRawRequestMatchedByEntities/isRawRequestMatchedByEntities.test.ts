import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

import type { WsFrame } from '@/utils/types';

import { equals } from '../../../../entities';
import { createWsFrame } from '../createWsFrame/createWsFrame';
import { isRawRequestMatchedByEntities } from './isRawRequestMatchedByEntities';

const textFrame = (raw: string): WsFrame => createWsFrame(Buffer.from(raw), false);
const binaryFrame = (raw: Buffer): WsFrame => createWsFrame(raw, true);

describe('isRawRequestMatchedByEntities', () => {
  it('Should match route configuration without entities', () => {
    expect(isRawRequestMatchedByEntities(textFrame('ping'), undefined)).toBe(true);
  });

  it('Should match route configuration with empty entities', () => {
    expect(isRawRequestMatchedByEntities(textFrame('ping'), {})).toBe(true);
  });

  it('Should match by isBinary', () => {
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { isBinary: false })).toBe(true);
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { isBinary: true })).toBe(false);
  });

  it('Should match by isBinary comparator', () => {
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { isBinary: equals(false) })).toBe(
      true
    );
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { isBinary: equals(true) })).toBe(
      false
    );
  });

  it('Should give the untouched text payload to the raw predicate', () => {
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { raw: (raw) => raw === 'ping' })).toBe(
      true
    );
    expect(isRawRequestMatchedByEntities(textFrame('ping'), { raw: (raw) => raw === 'pong' })).toBe(
      false
    );
  });

  it('Should give the untouched buffer to the raw predicate for a binary frame', () => {
    const payload = Buffer.from([0, 1, 254]);

    expect(
      isRawRequestMatchedByEntities(binaryFrame(payload), {
        raw: (raw) => Buffer.isBuffer(raw) && raw.equals(payload)
      })
    ).toBe(true);
    expect(
      isRawRequestMatchedByEntities(binaryFrame(payload), {
        raw: (raw) => Buffer.isBuffer(raw) && raw.equals(Buffer.from([0]))
      })
    ).toBe(false);
  });

  it('Should match only when every entity is matched', () => {
    const frame = textFrame('ping');
    const isPing = (raw: string | Buffer) => raw.toString() === 'ping';

    expect(isRawRequestMatchedByEntities(frame, { isBinary: false, raw: isPing })).toBe(true);
    expect(isRawRequestMatchedByEntities(frame, { isBinary: true, raw: isPing })).toBe(false);
  });
});
