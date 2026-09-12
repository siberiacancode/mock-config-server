import type { ErrorWsRequestArtifact, WsErrorParams } from '@/utils/types';

import { callWsRequestInterceptors, callWsResponseInterceptors, sleep } from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import { isErrorRequestMatchedByEntities } from '../../helpers';

interface CreateWsErrorHandlerParams extends WsHandlerContext {
  artifacts: ErrorWsRequestArtifact[];
}

export const createWsErrorHandler =
  ({
    artifacts,
    handshake,
    serverInterceptors,
    socket,
    broadcast,
    createWsEventContext,
    send,
    setDelay
  }: CreateWsErrorHandlerParams) =>
  async (error: NodeJS.ErrnoException) => {
    const event = createWsEventContext();
    const meta = { type: 'ws', event: 'error' } as const;

    await callWsRequestInterceptors(
      { event, meta, error, socket, broadcast, send },
      serverInterceptors
    );

    const matchedArtifact = artifacts.find((artifact) =>
      isErrorRequestMatchedByEntities(error, artifact.config.entities)
    );

    if (!matchedArtifact) return;

    await callWsRequestInterceptors(
      { event, meta, error, socket, broadcast, send },
      matchedArtifact.componentInterceptors ?? []
    );

    const params: WsErrorParams = {
      event,
      broadcast,
      error,
      handshake,
      socket,
      send,
      setDelay
    };

    if (matchedArtifact.config.settings?.delay) {
      await sleep(matchedArtifact.config.settings.delay);
    }

    const resolvedData = await matchedArtifact.config.data(params);

    await callWsResponseInterceptors(
      { event, data: resolvedData, meta, socket, broadcast, send },
      {
        componentInterceptors: matchedArtifact.componentInterceptors,
        serverInterceptors
      }
    );
  };
