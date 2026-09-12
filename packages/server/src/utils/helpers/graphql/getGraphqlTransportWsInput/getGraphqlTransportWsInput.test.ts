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

  it('Should parse valid messages', () => {
    expect(getGraphqlTransportWsInput('{"type":"connection_init"}')).toStrictEqual({
      type: 'connection_init'
    });
    expect(getGraphqlTransportWsInput('{"type":"ping"}')).toStrictEqual({ type: 'ping' });
    expect(getGraphqlTransportWsInput('{"type":"pong"}')).toStrictEqual({ type: 'pong' });
    expect(getGraphqlTransportWsInput('{"id":"1","type":"complete"}')).toStrictEqual({
      id: '1',
      type: 'complete'
    });
  });

  it('Should claim only client to server protocol types', () => {
    expect(getGraphqlTransportWsInput('{"id":"1","type":"next"}')).toBeUndefined();
    expect(getGraphqlTransportWsInput('{"id":"1","type":"error"}')).toBeUndefined();
    expect(getGraphqlTransportWsInput('{"type":"connection_ack"}')).toBeUndefined();

    expect(getGraphqlTransportWsInput('{"type":"custom"}')).toBeUndefined();
  });

  it('Should treat a plain json message as raw', () => {
    expect(getGraphqlTransportWsInput('{"event":"ping"}')).toBeUndefined();
  });

  it('Should not claim anything that is not a protocol message', () => {
    expect(getGraphqlTransportWsInput('"ping"')).toBeUndefined();
    expect(getGraphqlTransportWsInput('[1,2,3]')).toBeUndefined();
    expect(getGraphqlTransportWsInput('null')).toBeUndefined();
    expect(getGraphqlTransportWsInput('ping')).toBeUndefined();
  });
});
