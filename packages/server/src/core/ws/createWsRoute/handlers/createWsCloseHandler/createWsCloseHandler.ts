import type { Buffer } from 'node:buffer';

import type { CloseWsRequestArtifact, WsCloseParams } from '@/utils/types';

import { callWsRequestInterceptors, callWsResponseInterceptors, sleep } from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import { isCloseRequestMatchedByEntities } from '../../helpers';

interface CreateWsCloseHandlerParams extends WsHandlerContext {
  artifacts: CloseWsRequestArtifact[];
}

export const createWsCloseHandler =
  ({
    artifacts,
    handshake,
    serverInterceptors,
    socket,
    broadcast,
    createWsEventContext,
    send,
    setDelay
  }: CreateWsCloseHandlerParams) =>
  async (code: number, reasonBuffer: Buffer) => {
    const reason = reasonBuffer.toString();
    const event = createWsEventContext();
    const meta = { type: 'ws', event: 'close' } as const;

    await callWsRequestInterceptors(
      { event, meta, code, reason, socket, broadcast, send },
      serverInterceptors
    );

    const matchedArtifact = artifacts.find((artifact) =>
      isCloseRequestMatchedByEntities({ code, reason }, artifact.config.entities)
    );

    if (!matchedArtifact) return;

    await callWsRequestInterceptors(
      { event, meta, code, reason, socket, broadcast, send },
      matchedArtifact.componentInterceptors ?? []
    );

    const params: WsCloseParams = {
      event,
      broadcast,
      code,
      handshake,
      reason,
      socket,
      setDelay
    };

    if (matchedArtifact.config.settings?.delay) {
      await sleep(matchedArtifact.config.settings.delay);
    }

    const resolvedData = await matchedArtifact.config.data(params);

    await callWsResponseInterceptors(
      { event, data: resolvedData, meta, code, reason, socket, broadcast, send },
      {
        componentInterceptors: matchedArtifact.componentInterceptors,
        serverInterceptors
      }
    );
  };
