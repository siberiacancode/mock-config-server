import type { GraphQLMockServerConfig } from 'mock-config-server';
import { createGraphQLMockServer, startGraphQLMockServer } from 'mock-config-server';

export const graphQLMockServerConfig: GraphQLMockServerConfig = {
  baseUrl: '/graphql',
  configs: [
    {
      operationType: 'query',
      operationName: 'GetUsers',
      routes: [
        {
          data: [{ id: 1, emoji: '🎉' }]
        }
      ]
    }
  ]
};

createGraphQLMockServer(graphQLMockServerConfig);
startGraphQLMockServer(graphQLMockServerConfig);
