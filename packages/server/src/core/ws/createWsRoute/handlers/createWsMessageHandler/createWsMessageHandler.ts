import type { RawData } from 'ws';

import type {
  GraphqlTransportWsExecutionResult,
  GraphqlTransportWsParams,
  GraphqlTransportWsRequestArtifact,
  RawWsRequestArtifact,
  WsMessageParams
} from '@/utils/types';

import {
  callWsRequestInterceptors,
  callWsResponseInterceptors,
  getGraphqlTransportWsInput,
  parseGraphQLQuery,
  sleep
} from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import {
  createWsFrame,
  isGraphqlTransportWsRequestMatchedByEntities,
  isRawRequestMatchedByEntities,
  matchGraphqlTransportWsRequestArtifacts,
  matchRawRequestArtifacts,
  sendGraphqlTransportWsComplete,
  sendGraphqlTransportWsData,
  sendWsData
} from '../../helpers';

interface CreateWsMessageHandlerParams extends WsHandlerContext {
  completedSubscriptionIds: Set<string>;
  graphqlTransportWsArtifacts: GraphqlTransportWsRequestArtifact[];
  rawArtifacts: RawWsRequestArtifact[];
  requestPathname: string;
}

const RAW_META = { type: 'ws', event: 'message', messageType: 'raw' } as const;
const GRAPHQL_TRANSPORT_WS_META = {
  type: 'ws',
  event: 'message',
  messageType: 'graphql-ws'
} as const;

export const createWsMessageHandler =
  ({
    completedSubscriptionIds,
    graphqlTransportWsArtifacts,
    handshake,
    rawArtifacts,
    requestPathname,
    serverInterceptors,
    socket,
    broadcast,
    createWsEventContext,
    send,
    setDelay
  }: CreateWsMessageHandlerParams) =>
  async (raw: RawData, isBinary: boolean) => {
    const frame = createWsFrame(raw, isBinary);
    const event = createWsEventContext();

    // ✅ important:
    // the message type has to be known before the server interceptors run, otherwise a
    // graphql-ws frame calls them twice — once as raw and once as graphql-ws
    const graphqlTransportWsInput = frame.isBinary
      ? undefined
      : getGraphqlTransportWsInput(frame.raw.toString());

    await callWsRequestInterceptors(
      {
        event,
        meta: graphqlTransportWsInput ? GRAPHQL_TRANSPORT_WS_META : RAW_META,
        frame,
        socket,
        broadcast,
        send
      },
      serverInterceptors
    );

    const matchedRawArtifact = matchRawRequestArtifacts({
      artifacts: rawArtifacts,
      meta: { path: requestPathname }
    }).find((artifact) => isRawRequestMatchedByEntities(frame, artifact.config.entities));

    if (matchedRawArtifact) {
      await callWsRequestInterceptors(
        { event, meta: RAW_META, frame, socket, broadcast, send },
        matchedRawArtifact.componentInterceptors ?? []
      );

      const wsParams: WsMessageParams = {
        event,
        ...frame,
        handshake,
        broadcast,
        socket,
        send,
        setDelay
      };

      const resolvedData = await matchedRawArtifact.config.data(wsParams);
      const data = await callWsResponseInterceptors(
        { event, data: resolvedData, meta: RAW_META, frame, socket, broadcast, send },
        {
          componentInterceptors: matchedRawArtifact.componentInterceptors,
          serverInterceptors: matchedRawArtifact.serverInterceptors
        }
      );

      if (matchedRawArtifact.config.settings?.delay) {
        await sleep(matchedRawArtifact.config.settings.delay);
      }

      sendWsData(socket, data);
    }

    if (frame.isBinary) return;

    if (!graphqlTransportWsInput) {
      console.warn('[mock-config] Error parsing graphQL subscription input');
      return;
    }

    if (graphqlTransportWsInput.type === 'connection_init') {
      socket.send(JSON.stringify({ type: 'connection_ack' }));
      return;
    }

    if (graphqlTransportWsInput.type === 'ping') {
      socket.send(JSON.stringify({ type: 'pong' }));
      return;
    }

    if (graphqlTransportWsInput.type === 'complete') {
      completedSubscriptionIds.add(graphqlTransportWsInput.id);
      return;
    }

    if (graphqlTransportWsInput.type !== 'subscribe') {
      console.warn('Unsupported graphQL subscription input type', graphqlTransportWsInput.type);
      return;
    }

    const operationId = graphqlTransportWsInput.id;
    completedSubscriptionIds.delete(operationId);

    const query = parseGraphQLQuery(graphqlTransportWsInput.payload.query);
    if (!query) return;

    const matchedArtifact = matchGraphqlTransportWsRequestArtifacts({
      artifacts: graphqlTransportWsArtifacts,
      meta: {
        path: requestPathname,
        eventName: query.eventName,
        query: graphqlTransportWsInput.payload.query,
        operationType: query.operationType,
        operationName: query.operationName
      }
    }).find(({ config }) =>
      isGraphqlTransportWsRequestMatchedByEntities(
        graphqlTransportWsInput.payload.variables,
        config.entities
      )
    );

    if (!matchedArtifact) return;

    await callWsRequestInterceptors(
      { event, meta: GRAPHQL_TRANSPORT_WS_META, frame, socket, broadcast, send },
      matchedArtifact.componentInterceptors ?? []
    );

    const graphqlTransportWsParams: GraphqlTransportWsParams = {
      event,
      complete: () => {
        if (completedSubscriptionIds.has(operationId)) return;
        completedSubscriptionIds.add(operationId);
        sendGraphqlTransportWsComplete(socket, operationId);
      },
      entities: matchedArtifact.config.entities ?? {},
      eventName: query.eventName,
      handshake,
      next: (payload) => {
        if (completedSubscriptionIds.has(operationId)) return;
        sendGraphqlTransportWsData(socket, operationId, payload);
      },
      operationName: query.operationName,
      query: graphqlTransportWsInput.payload.query,
      raw,
      setDelay,
      socket,
      variables: graphqlTransportWsInput.payload.variables ?? {}
    };

    const resolvedData =
      typeof matchedArtifact.config.data === 'function'
        ? await matchedArtifact.config.data(graphqlTransportWsParams)
        : matchedArtifact.config.data;

    const data = await callWsResponseInterceptors(
      {
        event,
        data: resolvedData,
        meta: GRAPHQL_TRANSPORT_WS_META,
        frame,
        socket,
        broadcast,
        send
      },
      {
        componentInterceptors: matchedArtifact.componentInterceptors,
        serverInterceptors: matchedArtifact.serverInterceptors
      }
    );

    if (matchedArtifact.config.settings?.delay) {
      await sleep(matchedArtifact.config.settings.delay);
    }

    if (completedSubscriptionIds.has(operationId)) return;

    sendGraphqlTransportWsData(socket, operationId, data as GraphqlTransportWsExecutionResult);
  };
