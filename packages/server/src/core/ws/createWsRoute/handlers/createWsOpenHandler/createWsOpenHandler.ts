import type { ConnectionWsRequestArtifact, WsConnectionParams } from '@/utils/types';

import { callWsRequestInterceptors, callWsResponseInterceptors } from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import { isConnectionRequestMatchedByEntities, sendWsData } from '../../helpers';

interface CreateWsOpenHandlerParams extends WsHandlerContext {
  artifacts: ConnectionWsRequestArtifact[];
}

export const createWsOpenHandler =
  ({
    artifacts,
    handshake,
    serverInterceptors,
    socket,
    broadcast,
    createWsEventContext,
    send,
    setDelay
  }: CreateWsOpenHandlerParams) =>
  async () => {
    const event = createWsEventContext();
    const meta = { type: 'ws', event: 'open' } as const;

    await callWsRequestInterceptors({ event, meta, socket, broadcast, send }, serverInterceptors);

    const matchedArtifact = artifacts.find((artifact) =>
      isConnectionRequestMatchedByEntities(handshake, artifact.config.entities)
    );

    if (!matchedArtifact) return;

    await callWsRequestInterceptors(
      { event, meta, socket, broadcast, send },
      matchedArtifact.componentInterceptors ?? []
    );

    const params: WsConnectionParams = {
      event,
      broadcast,
      handshake,
      socket,
      send,
      setDelay
    };

    const resolvedData = await matchedArtifact.config.data(params);

    const data = await callWsResponseInterceptors(
      { event, data: resolvedData, meta, socket, broadcast, send },
      {
        componentInterceptors: matchedArtifact.componentInterceptors,
        serverInterceptors
      }
    );

    sendWsData(socket, data);
  };
