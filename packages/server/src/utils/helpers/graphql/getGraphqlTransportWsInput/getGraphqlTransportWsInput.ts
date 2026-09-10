import type { GraphqlTransportWsMessage } from '@/utils/types';

import { isPlainObject } from '../../isPlainObject/isPlainObject';

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

    // ✅ important:
    // anything that is not a protocol message falls out here — a non object json has no type,
    // and null or a non json string throws into the catch below
    if (!GRAPHQL_TRANSPORT_WS_MESSAGE_TYPES.includes(value.type)) return undefined;

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
