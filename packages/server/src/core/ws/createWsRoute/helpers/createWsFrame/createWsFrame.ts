import type { Buffer } from 'node:buffer';
import type { RawData } from 'ws';

import type { WsFrame } from '@/utils/types';

// ✅ important:
// the payload is never decoded or parsed here — a text frame is a string because the protocol
// said so, a binary frame stays a Buffer, and each protocol reads it the way it encodes it
export const createWsFrame = (raw: RawData, isBinary: boolean): WsFrame =>
  isBinary ? { isBinary: true, raw: raw as Buffer } : { isBinary: false, raw: raw.toString() };
