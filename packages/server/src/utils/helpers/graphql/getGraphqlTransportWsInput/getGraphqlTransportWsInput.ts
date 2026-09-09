import type { GraphqlTransportWsMessage } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

// ✅ important:
// this is the graphql-transport-ws protocol detector, not a json parser — a frame is claimed
// only when it carries a type the protocol defines, everything else stays a raw message
const GRAPHQL_TRANSPORT_WS_MESSAGE_TYPES = [
  'complete',
  'connection_init',
  'ping',
  'pong',
  'subscribe'
] satisfies GraphqlTransportWsMessage['type'][];

export const getGraphqlTransportWsInput = (message: string) => {
  try {
    const value = JSON.parse(message) as GraphqlTransportWsMessage;

    if (!isPlainObject(value) || !GRAPHQL_TRANSPORT_WS_MESSAGE_TYPES.includes(value.type)) {
      return undefined;
    }

    if (value.type === 'subscribe') {
      value.payload = {
        ...value.payload,
        variables: isPlainObject(value.payload?.variables) ? value.payload?.variables : undefined
      };
    }

    return value;
  } catch {
    return undefined;
  }
};
