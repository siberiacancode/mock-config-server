import type { RawData } from 'ws';

import type {
  GraphqlTransportWsExecutionResult,
  GraphqlTransportWsMessage,
  GraphqlTransportWsParams,
  GraphqlTransportWsRequestArtifact,
  WsEventContext,
  WsFrame,
  WsInterceptorMeta
} from '@/utils/types';

import {
  callWsRequestInterceptors,
  callWsResponseInterceptors,
  parseGraphQLQuery,
  sleep
} from '@/utils/helpers';

import type { WsHandlerContext } from '../../../types';

import {
  isGraphqlTransportWsRequestMatchedByEntities,
  matchGraphqlTransportWsRequestArtifacts,
  sendGraphqlTransportWsComplete,
  sendGraphqlTransportWsData
} from '../../../../helpers';

export const GRAPHQL_TRANSPORT_WS_META: WsInterceptorMeta = {
  type: 'ws',
  event: 'message',
  messageType: 'graphql-ws'
};

interface HandleGraphqlTransportWsMessageParams extends WsHandlerContext {
  artifacts: GraphqlTransportWsRequestArtifact[];
  completedSubscriptionIds: Set<string>;
  event: WsEventContext;
  frame: WsFrame;
  input: GraphqlTransportWsMessage;
  raw: RawData;
  requestPathname: string;
}

export const handleGraphqlTransportWsMessage = async ({
  completedSubscriptionIds,
  event,
  frame,
  artifacts,
  handshake,
  input,
  raw,
  requestPathname,
  serverInterceptors,
  socket,
  broadcast,
  send,
  setDelay
}: HandleGraphqlTransportWsMessageParams) => {
  if (input.type === 'connection_init') {
    socket.send(JSON.stringify({ type: 'connection_ack' }));
    return;
  }

  if (input.type === 'ping') {
    socket.send(JSON.stringify({ type: 'pong' }));
    return;
  }

  if (input.type === 'complete') {
    completedSubscriptionIds.add(input.id);
    return;
  }

  if (input.type !== 'subscribe') {
    console.warn('Unsupported graphQL subscription input type', input.type);
    return;
  }

  const operationId = input.id;
  completedSubscriptionIds.delete(operationId);

  const query = parseGraphQLQuery(input.payload.query);
  if (!query) return;

  const matchedArtifact = matchGraphqlTransportWsRequestArtifacts({
    artifacts,
    meta: {
      path: requestPathname,
      eventName: query.eventName,
      query: input.payload.query,
      operationType: query.operationType,
      operationName: query.operationName
    }
  }).find(({ config }) =>
    isGraphqlTransportWsRequestMatchedByEntities(input.payload.variables, config.entities)
  );

  if (!matchedArtifact) return;

  await callWsRequestInterceptors(
    { event, meta: GRAPHQL_TRANSPORT_WS_META, frame, socket, broadcast, send },
    matchedArtifact.componentInterceptors ?? []
  );

  const params: GraphqlTransportWsParams = {
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
    query: input.payload.query,
    raw,
    setDelay,
    socket,
    variables: input.payload.variables ?? {}
  };

  const resolvedData =
    typeof matchedArtifact.config.data === 'function'
      ? await matchedArtifact.config.data(params)
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
      serverInterceptors
    }
  );

  if (matchedArtifact.config.settings?.delay) {
    await sleep(matchedArtifact.config.settings.delay);
  }

  if (completedSubscriptionIds.has(operationId)) return;

  sendGraphqlTransportWsData(socket, operationId, data as GraphqlTransportWsExecutionResult);
};
