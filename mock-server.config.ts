import { MockServerConfig } from './src';

const mockServerConfig: MockServerConfig = {
  rest: {
    baseUrl: '/rest',
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [{ data: { emoji: '🦁', name: 'Nursultan' } }]
      }
    ]
  },
  graphql: {
    baseUrl: '/graphql',
    configs: [
      {
        operationName: 'GetCharacters',
        operationType: 'query',
        routes: [{ data: {} }]
      },
      {
        operationName: 'CreateCharacter',
        operationType: 'mutation',
        routes: [{ entities: { variables: { 'user.name': 'dima' } }, data: { omg: 'new' } }]
      }
    ]
  }
};

export default mockServerConfig;
