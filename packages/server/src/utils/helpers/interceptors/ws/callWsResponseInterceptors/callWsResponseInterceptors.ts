import type {
  Data,
  Interceptor,
  InterceptorName,
  WsCloseParams,
  WsEventContext,
  WsFrame,
  WsInterceptorMeta,
  WsResponseInterceptor,
  WsResponseInterceptorHandlerParams,
  WsSocket
} from '@/utils/types';

import { INTERCEPTOR_NAME } from '@/utils/constants';

import { sleep } from '../../../sleep';

interface CallWsResponseInterceptorsParams {
  code?: WsCloseParams['code'];
  data: Data;
  event: WsEventContext;
  frame?: WsFrame;
  meta: WsInterceptorMeta;
  reason?: WsCloseParams['reason'];
  socket: WsSocket;
  broadcast: (data: unknown) => void;
  send: (data: unknown) => void;
}

interface CallWsResponseInterceptors {
  componentInterceptors?: Interceptor[];
  serverInterceptors?: Interceptor[];
}

export const callWsResponseInterceptors = async (
  {
    code,
    data,
    event,
    frame,
    meta,
    reason,
    socket,
    broadcast,
    send
  }: CallWsResponseInterceptorsParams,
  { componentInterceptors = [], serverInterceptors = [] }: CallWsResponseInterceptors
) => {
  const setDelay: WsResponseInterceptorHandlerParams['setDelay'] = async (delay) => {
    await sleep(delay);
  };

  const responseInterceptorFnParams: WsResponseInterceptorHandlerParams = {
    code,
    frame,
    event,
    reason,
    setDelay,
    socket,
    send,
    broadcast
  };

  let updatedData = data;

  const interceptorNames: InterceptorName[] = [
    'ws.response.all',
    `ws.response.${meta.event}`,
    ...(meta.event === 'message' && meta.messageType === 'raw'
      ? (['ws.response.raw'] as const)
      : []),
    ...(meta.event === 'message' && meta.messageType === 'graphql-ws'
      ? (['graphql.response.subscription'] as const)
      : [])
  ];

  const responseInterceptors = [...componentInterceptors, ...serverInterceptors].filter(
    (interceptor): interceptor is WsResponseInterceptor =>
      interceptorNames.includes(interceptor[INTERCEPTOR_NAME])
  );

  for (const responseInterceptor of responseInterceptors) {
    updatedData = await responseInterceptor(updatedData, responseInterceptorFnParams);
  }
  return updatedData;
};
