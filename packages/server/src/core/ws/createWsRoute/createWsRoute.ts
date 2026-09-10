import type { WebSocketServer } from 'ws';

import type {
  CloseWsRequestArtifact,
  ConnectionWsRequestArtifact,
  ErrorWsRequestArtifact,
  GraphqlTransportWsRequestArtifact,
  Interceptor,
  RawWsRequestArtifact,
  WsEventContext,
  WsRequestArtifact,
  WsSocket
} from '@/utils/types';

import { sleep } from '@/utils/helpers';

import {
  createWsCloseHandler,
  createWsErrorHandler,
  createWsMessageHandler,
  createWsOpenHandler
} from './handlers';
import { broadcastWsData, sendWsData } from './helpers';

interface CreateWsRouteParams {
  server: WebSocketServer;
  serverInterceptors?: Interceptor[];
  wsRequestArtifacts: WsRequestArtifact[];
}

export const createWsRoute = ({
  server,
  wsRequestArtifacts,
  serverInterceptors = []
}: CreateWsRouteParams) => {
  let eventId = 0;
  const createWsEventContext = (): WsEventContext => {
    eventId += 1;
    return { id: eventId, timestamp: Date.now() };
  };

  return server.on('connection', async (rawSocket, handshake) => {
    const socket = rawSocket as WsSocket;

    const context = {
      handshake,
      socket,
      createWsEventContext,
      serverInterceptors,
      broadcast: (data: unknown) => broadcastWsData(server, data),
      send: (data: unknown) => sendWsData(socket, data),
      setDelay: async (delay: number) => {
        await sleep(delay);
      }
    };

    const [requestPathname] = handshake.url!.split('?');
    const matchedRequestArtifacts = wsRequestArtifacts.filter((artifact) => {
      if (artifact.baseUrl === '/') return true;
      return (
        requestPathname === artifact.baseUrl || requestPathname.startsWith(`${artifact.baseUrl}/`)
      );
    });

    const {
      connectionArtifacts,
      graphqlTransportWsArtifacts,
      rawArtifacts,
      closeArtifacts,
      errorArtifacts
    } = matchedRequestArtifacts.reduce(
      (acc, artifact) => {
        if (artifact.type === 'connection') acc.connectionArtifacts.push(artifact);
        if (artifact.type === 'graphql-ws') acc.graphqlTransportWsArtifacts.push(artifact);
        if (artifact.type === 'raw') acc.rawArtifacts.push(artifact);
        if (artifact.type === 'close') acc.closeArtifacts.push(artifact);
        if (artifact.type === 'error') acc.errorArtifacts.push(artifact);

        return acc;
      },
      {
        connectionArtifacts: [] as ConnectionWsRequestArtifact[],
        graphqlTransportWsArtifacts: [] as GraphqlTransportWsRequestArtifact[],
        rawArtifacts: [] as RawWsRequestArtifact[],
        closeArtifacts: [] as CloseWsRequestArtifact[],
        errorArtifacts: [] as ErrorWsRequestArtifact[]
      }
    );

    socket.on(
      'message',
      createWsMessageHandler({
        ...context,
        completedSubscriptionIds: new Set<string>(),
        graphqlTransportWsArtifacts,
        rawArtifacts,
        requestPathname
      })
    );

    socket.on('close', createWsCloseHandler({ ...context, closeArtifacts }));

    socket.on('error', createWsErrorHandler({ ...context, errorArtifacts }));

    await createWsOpenHandler({ ...context, connectionArtifacts })();
  });
};
