import { getUserRequest, getUsersRequest, postUserRequest } from './mock-requests';

const restMockServerConfig = {
  port: 31299,
  baseUrl: '/',
  configs: [getUserRequest, getUsersRequest, postUserRequest]
};

export default restMockServerConfig;
