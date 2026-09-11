import type { IncomingMessage } from 'node:http';

import type { Interceptor, WsEventContext, WsSocket } from '@/utils/types';

export interface WsHandlerContext {
  handshake: IncomingMessage;
  serverInterceptors: Interceptor[];
  socket: WsSocket;
  broadcast: (data: unknown) => void;
  createWsEventContext: () => WsEventContext;
  send: (data: unknown) => void;
  setDelay: (delay: number) => Promise<void>;
}
