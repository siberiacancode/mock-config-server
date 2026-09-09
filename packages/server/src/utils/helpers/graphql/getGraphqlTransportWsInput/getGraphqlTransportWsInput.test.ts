import { describe, expect, it } from 'vitest';

import { getGraphqlTransportWsInput } from './getGraphqlTransportWsInput';

describe('getGraphqlTransportWsInput', () => {
  it('Should get correct graphQL subscription input from message', () => {
    expect(
      getGraphqlTransportWsInput(`
        {
          "id": "1",
          "type": "subscribe",
          "payload": {
            "query": "subscription users { id }",
            "operationName": "Users",
            "variables": { "roomId": "1" }
          }
        }
      `)
    ).toStrictEqual({
      id: '1',
      payload: {
        query: 'subscription users { id }',
        operationName: 'Users',
        variables: { roomId: '1' }
      },
      type: 'subscribe'
    });
  });

  it('Should omit variables when not a plain object', () => {
    expect(
      getGraphqlTransportWsInput(`
        {
          "id": "1",
          "type": "subscribe",
          "payload": {
            "query": "subscription users { id }",
            "operationName": "Users",
            "variables": "primitive"
          }
        }
      `)
    ).toStrictEqual({
      id: '1',
      payload: {
        query: 'subscription users { id }',
        operationName: 'Users',
        variables: undefined
      },
      type: 'subscribe'
    });
  });

  it('Should parse complete message', () => {
    expect(
      getGraphqlTransportWsInput(`
        {
          "id": "1",
          "type": "complete"
        }
      `)
    ).toStrictEqual({
      id: '1',
      type: 'complete'
    });
  });

  it('Should parse connection_init, ping and pong messages', () => {
    expect(getGraphqlTransportWsInput('{"type":"connection_init"}')).toStrictEqual({
      type: 'connection_init'
    });
    expect(getGraphqlTransportWsInput('{"type":"ping"}')).toStrictEqual({ type: 'ping' });
    expect(getGraphqlTransportWsInput('{"type":"pong"}')).toStrictEqual({ type: 'pong' });
  });

  it('Should not claim server to client message types', () => {
    expect(getGraphqlTransportWsInput('{"id":"1","type":"next"}')).toBeUndefined();
    expect(getGraphqlTransportWsInput('{"id":"1","type":"error"}')).toBeUndefined();
    expect(getGraphqlTransportWsInput('{"type":"connection_ack"}')).toBeUndefined();
  });

  it('Should not claim a message without a protocol type', () => {
    expect(getGraphqlTransportWsInput('{"event":"ping"}')).toBeUndefined();
    expect(getGraphqlTransportWsInput('{"type":"custom"}')).toBeUndefined();
  });

  it('Should not claim json that is not a plain object', () => {
    expect(getGraphqlTransportWsInput('"ping"')).toBeUndefined();
    expect(getGraphqlTransportWsInput('[1,2,3]')).toBeUndefined();
    expect(getGraphqlTransportWsInput('null')).toBeUndefined();
  });

  it('Should not claim a message that is not json', () => {
    expect(getGraphqlTransportWsInput('ping')).toBeUndefined();
  });
});
