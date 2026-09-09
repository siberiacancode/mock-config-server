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
  eventContext: WsEventContext;
  frame: WsFrame;
  rawArtifacts: RawWsRequestArtifact[];
  requestPathname: string;
}

export const handleRawWsMessage = async ({
  eventContext,
  frame,
  handshake,
  rawArtifacts,
  requestPathname,
  socket,
  broadcast,
  send,
  setDelay
}: HandleRawWsMessageParams) => {
  const matchedArtifact = matchRawRequestArtifacts({
    artifacts: rawArtifacts,
    meta: { path: requestPathname }
  }).find((artifact) => isRawRequestMatchedByEntities(frame, artifact.config.entities));

  if (!matchedArtifact) return;

  await callWsRequestInterceptors(
    { eventContext, meta: RAW_WS_META, frame, socket, broadcast, send },
    matchedArtifact.componentInterceptors ?? []
  );

  const params: WsMessageParams = {
    eventContext,
    ...frame,
    handshake,
    broadcast,
    socket,
    send,
    setDelay
  };

  const resolvedData = await matchedArtifact.config.data(params);
  const data = await callWsResponseInterceptors(
    { eventContext, data: resolvedData, meta: RAW_WS_META, frame, socket, broadcast, send },
    {
      componentInterceptors: matchedArtifact.componentInterceptors,
      serverInterceptors: matchedArtifact.serverInterceptors
    }
  );

  if (matchedArtifact.config.settings?.delay) {
    await sleep(matchedArtifact.config.settings.delay);
  }

  sendWsData(socket, data);
};
