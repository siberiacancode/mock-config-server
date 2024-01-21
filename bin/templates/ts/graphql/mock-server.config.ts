import type { GraphQLMockServerConfig } from 'mock-config-server';

import { createUserMutation, getUserQuery, getUsersQuery } from './mock-requests';

const restMockServerConfig: GraphQLMockServerConfig = {
  port: 31299,
  baseUrl: '/',
  configs: [getUserQuery, getUsersQuery, createUserMutation]
};

export default restMockServerConfig;
