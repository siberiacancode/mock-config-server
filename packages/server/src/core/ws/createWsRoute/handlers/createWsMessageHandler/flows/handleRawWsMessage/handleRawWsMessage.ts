import type {
  RawWsRequestArtifact,
  WsEventContext,
  WsFrame,
  WsInterceptorMeta,
  WsMessageParams
} from '@/utils/types';

import { callWsRequestInterceptors, callWsResponseInterceptors, sleep } from '@/utils/helpers';

import type { WsHandlerContext } from '../../../types';

import {
  isRawRequestMatchedByEntities,
  matchRawRequestArtifacts,
  sendWsData
} from '../../../../helpers';

export const RAW_WS_META: WsInterceptorMeta = {
  type: 'ws',
  event: 'message',
  messageType: 'raw'
};

interface HandleRawWsMessageParams extends WsHandlerContext {
  artifacts: RawWsRequestArtifact[];
  event: WsEventContext;
  frame: WsFrame;
  requestPathname: string;
}

export const handleRawWsMessage = async ({
  event,
  frame,
  handshake,
  artifacts,
  requestPathname,
  serverInterceptors,
  socket,
  broadcast,
  send,
  setDelay
}: HandleRawWsMessageParams) => {
  const matchedArtifact = matchRawRequestArtifacts({
    artifacts,
    meta: { path: requestPathname }
  }).find((artifact) => isRawRequestMatchedByEntities(frame, artifact.config.entities));

  if (!matchedArtifact) return;

  await callWsRequestInterceptors(
    { event, meta: RAW_WS_META, frame, socket, broadcast, send },
    matchedArtifact.componentInterceptors ?? []
  );

  const params: WsMessageParams = {
    event,
    ...frame,
    handshake,
    broadcast,
    socket,
    send,
    setDelay
  };

  const resolvedData = await matchedArtifact.config.data(params);
  const data = await callWsResponseInterceptors(
    { event, data: resolvedData, meta: RAW_WS_META, frame, socket, broadcast, send },
    {
      componentInterceptors: matchedArtifact.componentInterceptors,
      serverInterceptors
    }
  );

  if (matchedArtifact.config.settings?.delay) {
    await sleep(matchedArtifact.config.settings.delay);
  }

  sendWsData(socket, data);
};
