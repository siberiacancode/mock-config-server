import type { ConnectionWsRequestArtifact, WsConnectionParams } from '@/utils/types';

import { callWsRequestInterceptors, callWsResponseInterceptors } from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import { isConnectionRequestMatchedByEntities, sendWsData } from '../../helpers';

interface CreateWsOpenHandlerParams extends WsHandlerContext {
  connectionArtifacts: ConnectionWsRequestArtifact[];
}

export const createWsOpenHandler =
  ({
    connectionArtifacts,
    handshake,
    serverInterceptors,
    socket,
    broadcast,
    createWsEventContext,
    send,
    setDelay
  }: CreateWsOpenHandlerParams) =>
  async () => {
    const eventContext = createWsEventContext();
    const meta = { type: 'ws', event: 'open' } as const;

    await callWsRequestInterceptors(
      { eventContext, meta, socket, broadcast, send },
      serverInterceptors
    );

    const matchedArtifact = connectionArtifacts.find((artifact) =>
      isConnectionRequestMatchedByEntities(handshake, artifact.config.entities)
    );

    if (!matchedArtifact) return;

    await callWsRequestInterceptors(
      { eventContext, meta, socket, broadcast, send },
      matchedArtifact.componentInterceptors ?? []
    );

    const params: WsConnectionParams = {
      eventContext,
      broadcast,
      handshake,
      socket,
      send,
      setDelay
    };

    const resolvedData = await matchedArtifact.config.data(params);

    const data = await callWsResponseInterceptors(
      { eventContext, data: resolvedData, meta, socket, broadcast, send },
      {
        componentInterceptors: matchedArtifact.componentInterceptors,
        serverInterceptors: matchedArtifact.serverInterceptors
      }
    );

    sendWsData(socket, data);
  };
