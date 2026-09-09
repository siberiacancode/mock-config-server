import type { RawData } from 'ws';

import type { GraphqlTransportWsRequestArtifact, RawWsRequestArtifact } from '@/utils/types';

import { callWsRequestInterceptors, getGraphqlTransportWsInput } from '@/utils/helpers';

import type { WsHandlerContext } from '../types';

import { createWsFrame } from '../../helpers';
import {
  GRAPHQL_TRANSPORT_WS_META,
  handleGraphqlTransportWsMessage,
  handleRawWsMessage,
  RAW_WS_META
} from './flows';

interface CreateWsMessageHandlerParams extends WsHandlerContext {
  completedSubscriptionIds: Set<string>;
  graphqlTransportWsArtifacts: GraphqlTransportWsRequestArtifact[];
  rawArtifacts: RawWsRequestArtifact[];
  requestPathname: string;
}

export const createWsMessageHandler =
  ({
    completedSubscriptionIds,
    graphqlTransportWsArtifacts,
    rawArtifacts,
    requestPathname,
    ...context
  }: CreateWsMessageHandlerParams) =>
  async (raw: RawData, isBinary: boolean) => {
    const frame = createWsFrame(raw, isBinary);
    const event = context.createWsEventContext();

    // ✅ important:
    // the protocol has to be known before the server interceptors run, otherwise a graphql-ws
    // frame calls them twice — once as raw and once as graphql-ws. a new protocol plugs in here:
    // detect it from the untouched frame, then add its flow below
    const graphqlTransportWsInput = frame.isBinary
      ? undefined
      : getGraphqlTransportWsInput(frame.raw);

    await callWsRequestInterceptors(
      {
        event,
        meta: graphqlTransportWsInput ? GRAPHQL_TRANSPORT_WS_META : RAW_WS_META,
        frame,
        socket: context.socket,
        broadcast: context.broadcast,
        send: context.send
      },
      context.serverInterceptors
    );

    if (!graphqlTransportWsInput) {
      await handleRawWsMessage({ ...context, event, frame, rawArtifacts, requestPathname });
      return;
    }

    await handleGraphqlTransportWsMessage({
      ...context,
      completedSubscriptionIds,
      event,
      frame,
      graphqlTransportWsArtifacts,
      input: graphqlTransportWsInput,
      raw,
      requestPathname
    });
  };
