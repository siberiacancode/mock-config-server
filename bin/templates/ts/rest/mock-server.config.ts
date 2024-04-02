import type { RestMockServerConfig } from 'mock-config-server';

import { getUserRequest, getUsersRequest, postUserRequest } from './mock-requests';

const restMockServerConfig: RestMockServerConfig = {
  port: 31299,
  baseUrl: '/',
  configs: [getUserRequest, getUsersRequest, postUserRequest]
};

export default restMockServerConfig;
