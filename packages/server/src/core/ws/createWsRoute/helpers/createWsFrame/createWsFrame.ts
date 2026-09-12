import type { Buffer } from 'node:buffer';
import type { RawData } from 'ws';

import type { WsFrame } from '@/utils/types';

export const createWsFrame = (raw: RawData, isBinary: boolean): WsFrame =>
  isBinary ? { isBinary: true, raw: raw as Buffer } : { isBinary: false, raw: raw.toString() };
