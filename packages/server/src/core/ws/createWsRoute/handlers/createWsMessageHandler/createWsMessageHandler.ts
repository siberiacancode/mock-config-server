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
      await handleRawWsMessage({
        ...context,
        artifacts: rawArtifacts,
        event,
        frame,
        requestPathname
      });
      return;
    }

    await handleGraphqlTransportWsMessage({
      ...context,
      artifacts: graphqlTransportWsArtifacts,
      completedSubscriptionIds,
      event,
      frame,
      input: graphqlTransportWsInput,
      raw,
      requestPathname
    });
  };
